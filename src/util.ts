export function convert_time_to_date(time: string) {
    return new Date("0 " + time);
}
export function convert_date_to_time(date: Date) {
    let hours = date.getHours().toString();
    if (+hours < 10) {
        hours = "0" + hours;
    }

    let minutes = date.getMinutes().toString();
    if (+minutes < 10) {
        minutes = "0" + minutes;
    }

    return hours + ":" + minutes
}
