/* eslint-disable no-undef */
import { Point } from './point.js';
import { DevInfo } from '../device/devInfo.js';

const MAX_CACHE_TO_CANVAS_POINT_NUM = 9;
const isWx = false;
// const isSupportOff = (!isWx || (isWx && wx.createOffscreenCanvas));
const isSupportOff = false;

export var Canvas = function (opts) {
  this.editor = opts.editor;
  this.width = opts.width;
  this.height = opts.height;
  if (isWx) {
    this.ctx = wx.createCanvasContext(opts.canvasId);
    if (isSupportOff) {
      this.offCtx = wx.createOffscreenCanvas();
    }
  } else {
    this.ctx = document.querySelector(`#${opts.canvasId}`).getContext('2d');
    this.offCanvas = document.createElement('canvas');
    this.offCtx = this.offCanvas.getContext('2d');
  }

  this.prePoint = undefined;
  this.pointsCache = [];

  const scaleH = opts.width / DevInfo.prototype.X_MAX;
  const scaleW = opts.height / DevInfo.prototype.Y_MAX;
  const scale = (scaleW > scaleH) ? scaleH : scaleW;
  this.ctx.scale(scale, scale);
  if(isWx){
      this.ctx.setLineWidth(30);
  } else {
      this.ctx.lineWidth = 30;
  }
  console.log(`scale:${scale}`);
};
Canvas.prototype = {
  constructor: Canvas,
  drawPoint(points) {
    if (this.editor) {
      this.recognizerPoint(points);
    }
    this.cachePoint(points);
  },
  drawPoint2OffCavas() {
    if (this.pointsCache.length < MAX_CACHE_TO_CANVAS_POINT_NUM) {
      return;
    }
    let minX, maxX, minY, maxY;
    const points = this.pointsCache;
    let point;
    this.offCtx.save();
    // this.offCtx.beginPath();

    if (this.prePoint) {
        minX = this.prePoint.x;
        maxX = this.prePoint.x;
        minY = this.prePoint.y;
        maxY = this.prePoint.y;
      this.offCtx.moveTo(this.prePoint.x, this.prePoint.y);
    } else {
        minX = 0;
        maxX = 0;
        minY = 0;
        maxY = 0;
      this.offCtx.moveTo(points[0].x, points[0].y);
    }
    for (let index = 0; index < points.length; index++) {
      point = points[index];
      minX = minX > point.x ? point.x : minX;
      maxX = maxX < point.x ? point.x : maxX;
      minY = minY > point.y ? point.y : minY;
      maxY = maxY < point.y ? point.y : maxY;
      switch (point.event) {
        case Point.prototype.MOVE:
          // if(index%2===0)
          {
            this.offCtx.lineTo(point.x, point.y);
            this.prePoint = point;
          }
          break;
        case Point.prototype.DOWN:
          this.offCtx.moveTo(point.x, point.y);
          this.prePoint = point;
          break;
      }
    }
    this.pointsCache.length = 0;

    this.offCtx.stroke(); // 画出当前路径的边框。默认颜色色为黑色。
      if(isWx) {
          this.offCtx.draw(true);
      } else {
          this.offCtx.restore();
      }
    // this.ctx.drawImage(this.offCanvas, minX, minY, maxX-minX, maxY-minY);
    this.ctx.drawImage(this.offCanvas, minX, minY);
    // this.ctx.drawImage(this.offCanvas);
  },
  drawPoint2Cavas() {
    if (this.pointsCache.length < MAX_CACHE_TO_CANVAS_POINT_NUM) {
      return;
    }
    const points = this.pointsCache;
    let point;
    this.ctx.save();
    this.ctx.beginPath();

    if (this.prePoint) {
      this.ctx.moveTo(this.prePoint.x, this.prePoint.y);
    } else {
      this.ctx.moveTo(points[0].x, points[0].y);
    }
    for (let index = 0; index < points.length; index++) {
      point = points[index];
      switch (point.event) {
        case Point.prototype.MOVE:
          // if(index%2===0)
          {
            this.ctx.lineTo(point.x, point.y);
            this.prePoint = point;
          }
          break;
        case Point.prototype.DOWN:
          this.ctx.moveTo(point.x, point.y);
          this.prePoint = point;
          break;
      }
    }
    this.pointsCache.length = 0;

    this.ctx.stroke(); // 画出当前路径的边框。默认颜色色为黑色。
      if(isWx) {
          this.offCtx.draw(true);
      }
  },
  cachePoint(points) {
    const that = this;
    for (let index = 0; index < points.length; index++) {
      this.pointsCache.push(points[index]);
    }
    if (this.pointsCache.length >= MAX_CACHE_TO_CANVAS_POINT_NUM) {
      setTimeout(() => {
        if (isSupportOff) {
            that.drawPoint2OffCavas();
        } else {
          that.drawPoint2Cavas();
        }
      });
    }
  },
  recognizerPoint(points) {
    let point;
    for (let index = 0; index < points.length; index++) {
      point = points[index];
      switch (point.event) {
        case Point.prototype.MOVE:
          this.editor.pointerMove(point);
          break;
        case Point.prototype.UP:
          this.editor.pointerUp(point);
          break;
        case Point.prototype.DOWN:
          this.editor.pointerDown(point);
          break;
      }
    }
  },
  drawTest() {
    const scale = 1;
    this.ctx.scale(scale, scale);

    let x; let
      y;
    for (let i = 0; i < 50; i++) {
      this.ctx.save();
      this.ctx.beginPath();
      if (x) {
        this.ctx.moveTo(x, y);
        const point = new Point(x, y, 11);
        this.editor.pointerDown(point);
      } else {
        const point = new Point(20, 20, 11);
        this.editor.pointerDown(point);
      }
      for (let index = 1; index < 50; index++) {
        x = index * (parseInt(Math.random() * 9 + 1));
        y = index * (parseInt(Math.random() * 9 + 1));
        var point = new Point(x, y, 11);
        this.editor.pointerMove(point);
        this.ctx.lineTo(x, y);
      }
      this.editor.pointerUp(point);
      this.ctx.closePath();
      this.ctx.stroke(); // 画出当前路径的边框。默认颜色色为黑色。
      this.ctx.draw(true);
    }
  },
  clear() {
    this.ctx.clearRect(0, 0, DevInfo.prototype.X_MAX, DevInfo.prototype.Y_MAX);
    this.ctx.draw(true);
    this.pointsCache.length = 0;
  },
};
