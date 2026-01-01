
export const parseCustomDate = (dateStr: string): Date => {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    const parts = dateStr.split(/[- ]/);
    if (parts.length >= 3) {
        const day = parseInt(parts[0], 10);
        const monthStr = parts[1].toLowerCase();
        let year = parseInt(parts[2], 10);
        if (parts[2].length === 2) {
            year += 2000;
        }

        const months: Record<string, number> = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
        };

        const month = months[monthStr.substring(0, 3)];
        if (month !== undefined) {
            return new Date(year, month, day);
        }
    }
    return new Date();
};
