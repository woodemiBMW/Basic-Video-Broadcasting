var lastPoint = null;
var curPoint = null;

export var Point = function (x, y, p, event) {
    this.x = x;
    this.y = y;
    this.p = p;
    this.t = Date.now();
    this.event = event;
};
// DOWN,MOVE,UP,UNKNOWN
Point.prototype.DOWN = 0;
Point.prototype.MOVE = 1;
Point.prototype.UP = 2;
Point.prototype.UNKNOWN = 3;

function Bytes2Str(arr) {
    var str = "";
    for(var i=0; i<arr.length; i++) {
        var tmp = arr[i].toString(16);
        if(tmp.length == 1){
            tmp = "0" + tmp;
        }
        str += tmp;
    }
    return str;
}
Point.prototype.POINT_LEN_BYTE = 6;
Point.prototype.parsePoints = function (data) {
    // console.log(Bytes2Str(new Uint8Array(data)));
    //6B一个点
    var pointNum = parseInt(data.byteLength/this.POINT_LEN_BYTE);
    var X=0, Y=0, P=0;
    var xl=0, xh = 0, yl=0, yh=0, pl=0, ph=0;
    var buff = new DataView(data);
    var points = [];
    var point;
    for(var index=0; index<pointNum; index++){
        xl = buff.getUint8(1 + (index*this.POINT_LEN_BYTE));
        xh = buff.getUint8(0 + (index*this.POINT_LEN_BYTE));
        yl = buff.getUint8(3 + (index*this.POINT_LEN_BYTE));
        yh = buff.getUint8(2 + (index*this.POINT_LEN_BYTE));
        pl = buff.getUint8(5 + (index*this.POINT_LEN_BYTE));
        ph = buff.getUint8(4 + (index*this.POINT_LEN_BYTE));
        X = ((xh<<8)&0xff00) + xl;
        Y = ((yh<<8)&0xff00) + yl;
        P = ((ph<<8)&0xff00) + pl;
        // console.log("x:" + X + ", y:" + Y + ", p:" + P);
        // console.log("xl:"+xl + ", xh:" + xh + ", yl:" + yl + "yh:"+yh + ", pl:" + pl + ", ph:" + ph);
        point = new Point(X, Y, P);
        Point.prototype.parseEvent(point);
        if(point.event !== Point.prototype.UNKNOWN){
            points.push(point);
        }
    }
    return points;
};
Point.prototype.parseEvent = function (point){
    if (point.p >= 2) {//此时有压感
        if (lastPoint == null) {//此时为此次输入的第一个点
            point.event = (Point.prototype.DOWN);
            lastPoint = point;//处理完Down事件之后，lastPoint为输入的第一个点
        } else {
            curPoint = point;
            point.event = (Point.prototype.MOVE);
            lastPoint = point;
        }
    } else {//此时无压感
        if (lastPoint == null) {//lastPoint为null,则说明上次操作已经是up了
            curPoint = null;
            point.event = (Point.prototype.UNKNOWN);
        } else {//lastPoint不为null，则说明这个点已经是此次输入的最后一个点了
            curPoint = point;
            point.event = (Point.prototype.UP);
            lastPoint = null;
            curPoint = null;
        }
    }
    return point;
};
