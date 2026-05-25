import { ContentCard } from "@/components/layout/content-card"

export default function OnDevelopment() {
    return (
        <div className="background w-full h-full flex flex-col items-center justify-center">
            <ContentCard>
                <div className="flex flex-col w-[36.5vw] h-[64vh] gap-[2vh] justify-center items-center">
                    <img src="./puzzle-piece.svg" style={{height: '15vh', width: '15vw'}}/>
                    <p className="text-l text-bold align-center">
                        Esta página está em desenvolvimento!
                    </p>
                    <span className="text-m text-bold align-center">
                        Sentimos muito pelo incômodo :(
                    </span>
                </div>
            </ContentCard>
        </div>
    )
};
