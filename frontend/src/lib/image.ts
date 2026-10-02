export function cropImageToSquare(file: File, size = 256, quality = 0.9): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);
            const side = Math.min(image.naturalWidth, image.naturalHeight);
            const sx = (image.naturalWidth - side) / 2;
            const sy = (image.naturalHeight - side) / 2;

            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const context = canvas.getContext("2d");
            if (!context) {
                reject(new Error("Não foi possível processar a imagem."));
                return;
            }

            context.imageSmoothingQuality = "high";
            context.drawImage(image, sx, sy, side, side, 0, 0, size, size);
            canvas.toBlob(
                (blob) => (blob ? resolve(blob) : reject(new Error("Não foi possível processar a imagem."))),
                "image/jpeg",
                quality
            );
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("O arquivo selecionado não é uma imagem válida."));
        };

        image.src = url;
    });
}
