export default function OnDevelopment() {
    return (
        <div className="bg-[#88c3c03b] w-full h-full flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl w-[36.5vw] h-[64vh] g-[4vh] flex flex-col items-center justify-center">
            <img src="./puzzle-piece.svg" style={{height: '15vh', width: '15vw'}}/>
            <p className="color-[#707070] text-l text-bold align-center">
                Esta página está em desenvolvimento!
            </p>
            <span className="color-[#707070] text-m text-bold align-center">
                Sentimos muito pelo incômodo :(
            </span>
        </div>
    </div>
    )
};
