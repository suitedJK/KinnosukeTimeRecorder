// ブラウザ起動時にブラウザアクションを更新
chrome.runtime.onStartup.addListener(() => {
    if (!KTR.view.update_from_cache()) {
        KTR.status.update(() => {
            // 起動時にAjax通信するとプロセスが残ってしまう問題への対応
            // chrome.runtime.reload();

            KTR.setAlarm();
        });
    }
});

// ページの読み込み完了時にもブラウザアクションを更新
window.addEventListener('load', () => {
    KTR.view.update_from_cache();
});

// コンテントスクリプトからのステータス更新通知
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (KTR.credential.valid()) {
        const status = KTR.status.scrape(message.html);
        if (status.authorized && status.code !== KTR.STATUS.UNKNOWN) {
            KTR.status.change(status);
        }
    }
    sendResponse();
});

chrome.runtime.onInstalled.addListener(() => {
    KTR.setAlarm();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (!KTR.credential.valid()) {
        return
    }

    const manifest = chrome.runtime.getManifest();
    const notificationId = Math.floor(Math.random() * 9007199254740992) + 1;

    const alarms = KTR.alarms.get();
    const format = 'HH:mm:ss';
    const now = moment(moment(), format);
    let args = {
        type: 'basic',
        title: manifest.name,
        iconUrl: manifest.icons['48'],
        priority: 1
    };

    KTR.service.mytop((html) => {
        const status = KTR.status.scan(html).code;
        if (alarm.name === 'startWorkAlarm') {
            if (!alarms.startAlarmBegin) {
                chrome.alarms.clear('startWorkAlarm');
                return;
            }
            if (status !== KTR.STATUS.BEFORE) {
                return;
            }
            // 出勤前かつ出勤アラートの設定がある場合
            if (alarms.startAlarmEnd) {
                const begin = moment(`${alarms.startAlarmBegin}:00`, format);
                const end = moment(`${alarms.startAlarmEnd}:59`, format);

                if (!now.isBetween(begin, end)) {
                    chrome.alarms.clear('startWorkAlarm');
                    return;
                }
            }

            args = Object.assign({message: KTR.MESSAGE.start}, args);
            chrome.notifications.create(`notification_${notificationId}`, args);
        }

        if (alarm.name === 'finishWorkAlarm') {
            if (!alarms.finishAlarmBegin) {
                chrome.alarms.clear('finishWorkAlarm');
                return;
            }
            if (status !== KTR.STATUS.ON_THE_JOB) {
                return;
            }
            // 出勤中かつ業務終了アラートの設定がある場合
            if (alarms.finishAlarmEnd) {
                const begin = moment(`${alarms.finishAlarmBegin}:00`, format);
                const end = moment(`${alarms.finishAlarmEnd}:59`, format);

                if (!now.isBetween(begin, end)) {
                    chrome.alarms.clear('finishWorkAlarm');
                    return;
                }
            }

            args = Object.assign({message: KTR.MESSAGE.finish}, args);
            chrome.notifications.create(`notification_${notificationId}`, args);
        }

        if (alarm.name === 'leaveWorkAlarm') {
            if (!alarms.leaveAlarmBegin) {
                chrome.alarms.clear('leaveWorkAlarm');
                return;
            }
            if (status !== KTR.STATUS.FINISH) {
                return;
            }
            // 業務終了済みかつ退勤アラートの設定がある場合
            if (alarms.leaveAlarmEnd) {
                const begin = moment(`${alarms.leaveAlarmBegin}:00`, format);
                const end = moment(`${alarms.leaveAlarmEnd}:59`, format);

                if (!now.isBetween(begin, end)) {
                    chrome.alarms.clear('leaveWorkAlarm');
                    return;
                }
            }

            args = Object.assign({message: KTR.MESSAGE.leave}, args);
            chrome.notifications.create(`notification_${notificationId}`, args);
        }
    });
});
