$(document).ready( function() {
    $('.source-button .add-new').on('click', function() {
        $('.source-button .modal-content .content').append('<tr><td><input type="text"  id="enter2" class="form-control enter link-source"></td><td><img class="delete" src="assets/img/remove.png" alt=""></td></tr>')
    })
    $('.hashtag-button .add-new').on('click', function() {
        var str = $("#enter2").val();
        console.log(str)
        $('.hashtag-button .content-hashtag').append(`<a class="ht-tag">#${str}<img class="removeht" src='assets/img/removeht.png'></a>`)
    })
    // $('.image-uploader .uploaded').remove();
    
})
$(document).on('click', '.source-button .delete', function(){
    $(this).closest("tr")   
        .remove(); 
})
$(document).on('click', '.removeht', function(){
    console.log('aaa')
    $(this).parent().remove();
})

$(document).on('click', '.search .seemore', function(){
    console.log('aaa')
    $(this).parent().css({
        "overflow":"unset",
        "height": "100%"
    });
    $(this).remove()
})
$('.parent li.nav-item').on('click', function () {
    $(this).toggleClass('active')
})

$('#form-person-lost .form-group .options').on('click', function() {
    $(this).parent().toggleClass('active');
    $(this).parent().find('.option-child').toggleClass('active')
})
$('.input-images-2').imageUploader();
$('.bottom').append('<div class="uploaded"></div>')
function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}