import api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import type { AvatarDTO } from "@/shared/dtos/avatar/AvatarDTO";
import type { CurrentUserDTO } from "@/shared/dtos/user/CurrentUserDTO";
import { avatarPresetSrc } from "@/shared/models/avatar-presets";
import { createContext, useEffect, useState, type ReactNode } from "react";

interface CurrentUserContextData {
    user: CurrentUserDTO | null,
    avatar: AvatarDTO | null,
    avatarSrc: string | null,
    reloadUser(): Promise<void>,
    choosePreset(preset: string): Promise<void>,
    uploadPhoto(photo: Blob): Promise<void>,
    removeAvatar(): Promise<void>
};

const CurrentUserContext = createContext<CurrentUserContextData>({} as CurrentUserContextData);

const fetchCurrentUser = () =>
    api.get<CurrentUserDTO>('/user/me', { data: {}, skipExceptionModal: true }).then(({ data }) => data);

export const CurrentUserProvider = (params: { children: ReactNode }) => {

    const { signed } = useAuth();
    const [user, setUser] = useState<CurrentUserDTO | null>(null);
    const [avatar, setAvatar] = useState<AvatarDTO | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!signed) return;
        let active = true;

        fetchCurrentUser()
            .then((data) => { if (active) setUser(data); })
            .catch(() => { if (active) setUser(null); });

        api.get<AvatarDTO>('/user/me/avatar', { data: {}, skipExceptionModal: true })
            .then(async ({ data }) => {
                let url: string | null = null;
                if (data.hasPhoto) {
                    const photo = await api.get<Blob>('/user/me/avatar/photo', {
                        data: {}, responseType: 'blob', skipExceptionModal: true
                    });
                    url = URL.createObjectURL(photo.data);
                }

                if (!active) {
                    if (url) URL.revokeObjectURL(url);
                    return;
                }
                setAvatar(data);
                setPhotoUrl(url);
            })
            .catch(() => {
                if (!active) return;
                setAvatar(null);
                setPhotoUrl(null);
            });

        return () => {
            active = false;
            setUser(null);
            setAvatar(null);
            setPhotoUrl(null);
        };
    }, [signed]);

    useEffect(() => () => {
        if (photoUrl) URL.revokeObjectURL(photoUrl);
    }, [photoUrl]);

    async function reloadUser() {
        setUser(await fetchCurrentUser());
    }

    async function choosePreset(preset: string) {
        const { data } = await api.put<AvatarDTO>('/user/me/avatar/preset', { preset }, { skipExceptionModal: true });
        setAvatar(data);
        setPhotoUrl(null);
    }

    async function uploadPhoto(photo: Blob) {
        const formData = new FormData();
        formData.append('file', photo, 'avatar.jpg');

        const { data } = await api.put<AvatarDTO>('/user/me/avatar/photo', formData, { skipExceptionModal: true });
        setAvatar(data);
        setPhotoUrl(URL.createObjectURL(photo));
    }

    async function removeAvatar() {
        await api.delete('/user/me/avatar', { skipExceptionModal: true });
        setAvatar({ preset: null, hasPhoto: false, updatedAt: null });
        setPhotoUrl(null);
    }

    const avatarSrc = photoUrl ?? (avatar?.preset ? avatarPresetSrc(avatar.preset) : null);

    return (
        <CurrentUserContext.Provider value={{ user, avatar, avatarSrc, reloadUser, choosePreset, uploadPhoto, removeAvatar }}>
            {params.children}
        </CurrentUserContext.Provider>
    );
}

export default CurrentUserContext;
