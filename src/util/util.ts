import { async } from 'q';

// js (src/assets/js/utils.js)
declare const Utils: any;

export function range(i: number) {
    return Array(i);
}

export function formatDate(date: Date) {
    if(date) {
        let day: number = date.getDate();
        let month: number = date.getMonth() + 1;
        let year: number = date.getFullYear();

        return year + '-' + month + '-' + day;
    }else{
        return '';
    }
}

export function notifyError(error: Error, isOnlyOne? : boolean) {
    isOnlyOne = true;
    if(error) {
        console.log(error.message);
        Utils.showNotification('top', 'center', 'danger', error.message, isOnlyOne);
    }else{
        console.log('error',error);
    }
}

export function notifyInfo(message: string, isOnlyOne? : boolean) {
    isOnlyOne = true;
    Utils.showNotification('top', 'center', 'success', message, isOnlyOne);
}

export function refresh(): void {
    window.location.reload();
}