/**
 * Author: liyuelong1020@gmail.com
 * Date: 2015-01-09
 * Description: 3D球形滚动插件
 */

var scroll_3D = (function(require, exports) {
//    var animationFrame = window.requestAnimationFrame   ||
//                        window.webkitRequestAnimationFrame ||
//                        function( callback ){
//                            window.setTimeout(callback, 1000 / 60);
//                        };
//    var cancelAnimationFrame = window.cancelAnimationFrame ||
//                                window.webkitCancelAnimationFrame  ||
//                                function( timer ){
//                                    window.clearTimeout(timer);
//                                };

    var tagEle, paper, RADIUS, fallLength, tags = [], angleX, angleY, CX, CY, EX, EY, timer;

    // 3D旋转节点对象
    var tag = function (ele, x, y, z) {
        this.ele = ele;
        this.x = x;
        this.y = y;
        this.z = z;
    };

    tag.prototype = {
        // 旋转方法
        move: function () {
            var elem = this.ele;
            var style = elem.style;
            var scale = fallLength / (fallLength - this.z);
            var alpha = (this.z + RADIUS) / (2 * RADIUS);

            style.opacity = alpha + 0.5;
            style.zIndex = parseInt(scale * 100);
            style.transform =
                style.webkitTransform =
                    'translate(' + (this.x + CX - elem.offsetWidth / 2).toFixed(2)  + 'px, ' +
                        (this.y + CY - elem.offsetHeight / 2).toFixed(2) + 'px)' /*+ '  scale(' + scale.toFixed(2) + ')'*/;
            // 触发滚动事件
            typeof elem.onScroll3D === 'function' && elem.onScroll3D(this.x, this.y, this.z);
        }
    };

    // 计算旋转参数
    var rotate = function () {
        var cosX = Math.cos(angleX);
        var sinX = Math.sin(angleX);
        var cosY = Math.cos(angleY);
        var sinY = Math.sin(angleY);
        tags.forEach(function (tag) {
            var y1 = tag.y * cosX - tag.z * sinX;
            var z1 = tag.z * cosX + tag.y * sinX;
            tag.y = y1;
            tag.z = z1;

            var x1 = tag.x * cosY - tag.z * sinY;
            z1 = tag.z * cosY + tag.x * sinY;
            tag.x = x1;
            tag.z = z1;

            tag.move();
        });
    };

    var start = function() {
//        var go = function() {
//            rotate();
//            timer = animationFrame(go);
//        };
//        cancelAnimationFrame(timer);
//        timer = animationFrame(go);

        timer = setInterval(rotate, 1000/36);
    };
    var stop = function() {
        clearInterval(timer);
//        cancelAnimationFrame(timer);

        timer = null;
    };

    // 绑定事件
    var addEvent = function() {
        var pointX = 0, pointY = 0, flag = true;

        // 减小触摸事件触发的频率
        var buffer = function(x, y) {
            if(flag){
                setTimeout(function() {
                    var diffX = (pointX - x) * 0.01;
                    var diffY = (pointY - y) * 0.01;

                    var cosX = Math.cos(diffY);
                    var sinX = Math.sin(diffY);
                    var cosY = Math.cos(diffX);
                    var sinY = Math.sin(diffX);
                    tags.forEach(function (tag) {
                        var y1 = tag.y * cosX - tag.z * sinX;
                        var z1 = tag.z * cosX + tag.y * sinX;
                        tag.y = y1;
                        tag.z = z1;

                        var x1 = tag.x * cosY - tag.z * sinY;
                        z1 = tag.z * cosY + tag.x * sinY;
                        tag.x = x1;
                        tag.z = z1;

                        tag.move();
                    });

                    pointX = x;
                    pointY = y;

                    flag = true;
                }, 1000/36);

                flag = false;
            }
        };

        paper.addEventListener("touchstart", function (event) {
            event.preventDefault();
            var client = event.touches[0] || event.changedTouches[0];
            pointX = client.clientX;
            pointY = client.clientY;

            stop();
        });
        paper.addEventListener("touchmove", function (event) {
            event.preventDefault();

            var client = event.touches[0] || event.changedTouches[0];

            buffer(client.clientX, client.clientY);
        });
        paper.addEventListener("touchend", function (event) {
            event.preventDefault();

            var client = event.touches[0] || event.changedTouches[0];
            var x =  EX + CX - client.clientX;
            var y =  EY + CY - client.clientY;
            angleY = x * 0.0002;
            angleX = y * 0.0002;

            start();
        });

//        paper.addEventListener("mousemove", function (event) {
//            stop();
////            buffer(event.clientX, event.clientY);
//        });
//        paper.addEventListener("mouseout", function (event) {
//            start();
//        });
    };

    return {
        init: function (selector) {
            paper = document.querySelector(selector);                // 滚动节点父层
            tagEle = paper.children;                                // 滚动节点

            var paperWidth = paper.offsetWidth;
            var paperHeight = paper.offsetHeight;

            RADIUS = Math.min(paperWidth, paperHeight) / 2;           // 球形半径
            fallLength = paperWidth * 2;
            angleX = Math.PI / paperWidth;
            angleY = Math.PI / paperWidth;
            CX = paperWidth / 2;
            CY = paperHeight / 2;
            EX = paper.offsetLeft + document.body.scrollLeft + document.documentElement.scrollLeft;
            EY = paper.offsetTop + document.body.scrollTop + document.documentElement.scrollTop;

            addEvent();

            for (var i = 0, len = tagEle.length; i < len; i++) {
                var k = (2 * (i + 1) - 1) / len - 1;
                var a = Math.acos(k);
                var b = a * Math.sqrt(len * Math.PI);
                var x = RADIUS * Math.sin(a) * Math.cos(b);
                var y = RADIUS * Math.sin(a) * Math.sin(b);
                var z = RADIUS * Math.cos(a);
                var t = new tag(tagEle[i], x, y, z);

                tags.push(t);
                t.move();
            }

            start();
        },
        start: start,
        stop: stop
    }
})();
