$(document).ready(function(){

    $(function() {
        $('#terminal').terminal({
            hello: function() {
                this.echo("Hello world!");
            }
        }, {checkArity: false});
    });

});