$(function(){
    var typingBool = false; 
    var typingIdx=0; 

    // 타이핑될 텍스트를 가져온다 
    var typingTxt = $(".home_txt").text(); 

    typingTxt=typingTxt.split(""); // 한글자씩 자른다. 

    if(typingBool==false){ 
    // 타이핑이 진행되지 않았다면 
    typingBool=true;     
    var tyInt = setInterval(typing,100); // 반복동작 
    } 
        
    function typing(){ 
    if(typingIdx<typingTxt.length){ 
        // 타이핑될 텍스트 길이만큼 반복 
        $(".home").append(typingTxt[typingIdx]);
        // 한글자씩 이어준다. 
        typingIdx++; 
    } else{ 
        //끝나면 반복종료 
        clearInterval(tyInt); 
    } 
    }  

    /* #home */
    $("#home .inner p").eq(0).addClass("on");

    /* #home의 목차들 */
    for(var i=0; i<$("#home").find("li").length;i++){
        $("#home").find("li").eq(i).addClass('on').css({
            "animation-delay":(0.3*i)+"s"
        });
    }


     //변수 ht에 브라우저의 높이값을 저장
    var ht =$(window).height();
    $("section").height(ht);
    
    $(window).on("resize", function(){
        ht = $(window).height();
        $("section").height(ht);
    });

    $("section").bind('wheel',function(e){
        e.preventDefault();
        if(e.originalEvent.wheelDelta>0 || e.originalEvent.detail<0){
            var prev = $(this).prev().offset().top;
            $("html, body").stop().animate({
                "scrollTop": prev
            }, 1400, 'easeOutBounce');
        }else{
            var next = $(this).next().offset().top;
            $("html, body").stop().animate({
                "scrollTop": next
            }, 1400, 'easeOutBounce');
        }

    });

    /* 섹션 4번째 bxSlider */
    $("ul.m_slide").bxSlider({
        auto:true,
        pagerCustom:'.pager',
        nextSelector:'#next',
        prevSelector:'#prev',
        nextText:'&gt;',
        prevText:'&lt;',
        mode:'fade',
        pause: 10000,
        touchEnabled: (navigator.maxTouchPoints > 0)/* bxslide의 a태그 버튼 오류를 잡아줌 */
    });
});