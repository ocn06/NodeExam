//jQuery 
$("#form").submit(function() {
    console.log('form submit');
    $.ajax({
        data: $(this).serialize(),
        url: this.action,
        type: this.method,
        //callback function
        error: error => {
            console.log("Error ", error);
        },
        success: result => {
            console.log("result", result);
            switch(result.status) {
                case 200:
                    location.href = "/index";
                    break;
                case 403:
                    console.error(result.error);
                    break;
            }
        }
    });
    return false;
});