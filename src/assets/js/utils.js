let alertHolder = [];

Utils = {
    showNotification: function(from, align, type, message, isOnlyOne) {
        if(isOnlyOne) {
            while(alertHolder.length > 0) {
                alertHolder.shift().close();
            }
        }

        var alert = $.notify({
            message: message
        }, {
            type: type,
            timer: 250,
            placement: {
                from: from,
                align: align
            },
            z_index: 5000,
            template:`
            <div data-notify="container" class="center-notify alert alert-{0}" role="alert">
                <button type="button" aria-hidden="true" class="close" data-dismiss="alert">
                    <i class="nc-icon nc-simple-remove"></i>
                </button>
                <span data-notify="message">{2}</span>
            </div>`,
            onClose: () => {
                alertHolder.shift();
            }
        });
        alertHolder.push(alert);
    }
};