$(function () {
    var boxWrap = $("#boxWrap");
    //当前加载位置
    var curIndex = 0;
    //一列box个数
    var cols = 0;
    var curHeights = [];
    //一次加载个数
    var loadCount = 0;
    //过滤条件
    var filter = {};

    init();
    loadItem();

    function init(){
        //一列box个数
        cols = Math.floor($(".container").eq(0).width() / 400);
        cols = cols > 0 ? cols : 1;
        loadCount = cols * 2;
        //初始化数组
        for (var i = 0; i < cols; i++) {
            var obj = {};
            obj["index"] = i;
            obj["left"] = 400 * i;
            obj["top"] = 0;
            curHeights[i] = obj;
        }
    }

    function loadItem(){
        $.getJSON("../members.json", function (result) {
            //如果有过滤条件
            if(filter){
                //过滤
                result = result.filter(function(item, index){
                    var flag = true;
                    for(var key in filter){
                        if(item[key] != filter[key]){
                            flag = false;
                        }
                    }
                    return flag;
                });
            }
            $(".total").html("共 " + result.length + " 位成员");
            for (var j = curIndex, length = curIndex + loadCount; j < length && curIndex < result.length; j++, curIndex++) {
                var m = result[j];

                //社交
                var social = '<span class="social">';
                if(m.github){
                    social += '<a href="' + m.github + '" target="_blank">' +
                    '<img src="images/github.png" title="github"/>' +
                    '</a>';
                }
                if(m.weibo){
                    social += '<a href="' + m.weibo + '" target="_blank">' +
                    '<img src="images/weibo.png" title="新浪微博"/>' +
                    '</a>';
                }
                social += '</span>';

                //包装
                var box = $('<div class="box-item">' +
                '<div>' +
                '<img class="head" src="' + m.head + '" width="150" height="150"/>' +
                '</div>' +
                '<section>' +
                '<h3>' + m.name  + '</h3><span class="major">( ' + m.grade + "级" + m.major + ' )</span>' + social +
                '<article>' + (m.desc ? m.desc : "这个人太懒，什么都没有留下") + '</article>' +
                '</section>' +
                '</div>');
                boxWrap.append(box);
                curHeights.sort(function (a, b) {
                    return a.top - b.top;
                });
                var referBox = curHeights[0];
                box.css({
                    "left": referBox.left + "px",
                    "top": referBox.top + "px"
                });
                curHeights[0] = {
                    "index": referBox.index,
                    "left": parseInt(box.css("left")),
                    "top": box.height() + parseFloat(box.css("top")) + 40
                };
                boxWrap.height(curHeights[0].top + 40);
            }
        });
    }

    window.onscroll = function(){
        if(window.scrollY + window.innerHeight > curHeights[0].top){
            loadItem();
        }
    };

    //过滤面板的事件监听
    var condition = $("#condition");
    var filterWrap = $("#filterWrap");
    $("#filter").find(".title").delegate(".filterBtn", "click", function(){
        //显示隐藏筛选下拉框
        if($(this).hasClass("on")){
            $(this).removeClass("on").find(".toggle").html("显示筛选");
            condition.slideUp();
        }else{
            $(this).addClass("on").find(".toggle").html("隐藏筛选");
            condition.slideDown();
        }
    }).delegate("#filterWrap>span", "click", function(){
        //取消筛选
        var data = $(this).attr("data-filter");
        var type = data.split("-")[0];
        condition.find("." + type).find(".content").append($(this));

        //将过滤条件取消
        delete filter[type];

        //重新加载
        boxWrap.html('');
        curIndex = 0;
        init();
        loadItem();
    });
    condition.delegate(".flag", "click", function(){
        var data = $(this).attr("data-filter");
        var type = data.split("-")[0];

        //将过滤条件添加到过滤面板上
        var f = filterWrap.find("[data-filter^='" + type + "']");
        //如果已经有同类筛选，则去掉该选项
        if(f.length !== 0){
            f.each(function(i){
                $(this).appendTo(condition.find("." + type).find(".content"));
            });
        }
        filterWrap.append($(this));
        filter[type] = data.split("-")[1];

        //重新加载
        boxWrap.html('');
        curIndex = 0;
        init();
        loadItem();
    });
});
