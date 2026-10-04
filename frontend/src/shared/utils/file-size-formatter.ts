export function fileSizeFormatter(size: number): string {
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const formattedNumber = parseFloat((size / Math.pow(1024, i)).toFixed(2));

    return `${new Intl.NumberFormat().format(formattedNumber)} ${sizes[i]}`;
}
