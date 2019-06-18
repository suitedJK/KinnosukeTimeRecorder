$(function() {
    restore();
    $('#saveBtn').click(save);
});

// 設定を読み込んでフォームにセットする
function restore() {
    KTR.credential.get((cstmid, userid, passwd) => {
        $('#cstmid').val(cstmid);
        $('#userid').val(userid);
        $('#passwd').val(passwd);
    });

    $(`[name="site"]:eq(${KTR.site.get()})`).prop('checked', true);

    const msg = KTR.message.get();
    $('#start').val(msg.start).prop('placeholder', KTR.MESSAGE.start);
    $('#finish').val(msg.finish).prop('placeholder', KTR.MESSAGE.finish);
    $('#leave').val(msg.leave).prop('placeholder', KTR.MESSAGE.leave);

    const alarms = KTR.alarms.get();
    $('#start-alarm-begin').val(alarms.startAlarmBegin);
    $('#start-alarm-end').val(alarms.startAlarmEnd);
    $('#finish-alarm-begin').val(alarms.finishAlarmBegin);
    $('#finish-alarm-end').val(alarms.finishAlarmEnd);
    $('#leave-alarm-begin').val(alarms.leaveAlarmBegin);
    $('#leave-alarm-end').val(alarms.leaveAlarmEnd);

    const others = KTR.others.get();
    $('#remarks-template').val(others.remarksTemplate);
}

// 設定を保存する
function save() {
    KTR.credential.update(
        $('#cstmid').val(),
        $('#userid').val(),
        $('#passwd').val()
    );
    KTR.site.update($('[name="site"]:checked').val());
    KTR.message.update({
        start: $('#start').val(),
        finish: $('#finish').val(),
        leave: $('#leave').val()
    });
    KTR.alarms.update({
        startAlarmBegin: $('#start-alarm-begin').val(),
        startAlarmEnd: $('#start-alarm-end').val(),
        finishAlarmBegin: $('#finish-alarm-begin').val(),
        finishAlarmEnd: $('#finish-alarm-end').val(),
        leaveAlarmBegin: $('#leave-alarm-begin').val(),
        leaveAlarmEnd: $('#leave-alarm-end').val()
    });
    KTR.others.update({
        remarksTemplate: $('#remarks-template').val()
    });

    KTR.notify({
        message: '保存しました。'
    });

    KTR.service.logout(() => {
        KTR.status.update(null, true);
    });
}
