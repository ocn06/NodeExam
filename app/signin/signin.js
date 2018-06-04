//jQuery
$(document).ready(function() {
    $("#signinform").submit(function() {
        console.log('form submit');
        $.ajax({
            data: $(this).serialize(),
            url: this.action,
            type: this.method,
            error: error => {
                console.log("Error ", error);
            },
            success: result => {
                console.log("result", result);
                switch(result.status) {
                    case 200:
                        location.href = "/";
                        break;
                    case 403:
                        console.error(result.error);
                        break;
                }
            }
        });
        return false;
    }); 
});
