import "@/styles/login.css";

export default function OnDevelopment() {
    return (
        <div className="background">
        <div className="login-card">
            <img src="./puzzle-piece.svg" style={{height: '15vh', width: '15vw'}}/>
            <p className="on-development-header">
                Esta página está em desenvolvimento!
            </p>
            <span className="on-development-sub">
                Sentimos muito pelo incômodo :(
            </span>
        </div>
    </div>
    )
};
