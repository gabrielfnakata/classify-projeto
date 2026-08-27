import axios from "axios";

type ApiExceptionPayload = {
    code?: string;
    message?: string;
    status?: number;
};


declare module "axios" {
    export interface AxiosRequestConfig {
        skipExceptionModal?: boolean;
    }
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': "application/json"
    }
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.config?.skipExceptionModal) {
            return Promise.reject(error);
        }

        const payload = error?.response?.data as ApiExceptionPayload | undefined;

        if (payload && (payload.message || payload.code)) {
            const eventDetail = {
                code: payload.code ?? "UNKNOWN_ERROR",
                message: payload.message ?? "Não foi possível concluir a operação.",
                status: error?.response?.status ?? 500,
            };

            window.dispatchEvent(new CustomEvent("exception-modal:show", { detail: eventDetail }));
        }

        return Promise.reject(error);
    }
);

export default api;