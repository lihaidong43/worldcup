// pages/upload/preview.js
var systemInfo = wx.getSystemInfoSync();
let { windowWidth,windowHeight,screenWidth,screenHeight} = systemInfo
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photoUrl : null,
    imageWidth : '0rpx',
    imageHeight : '0rpx',
    maskDisplay : 'none',
    maskLeft : '0rpx',
    maskHeight : '0rpx',
    scale : 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.choosePhoto(options.avatarUrl)        
  },

  choosePhoto : function(){
    wx.chooseImage({
      success: (res) => {
        var tempFilePaths = res.tempFilePaths
        this.setData({
          photoUrl: tempFilePaths[0]
        })
      },
      fail : ()=> {
        wx.navigateTo({
          url: '/pages/index/index',
        })
      }
    })
  },
  imageLoad : function(e){
    var $width = e.detail.width;
    var $height = e.detail.height;
    var scale = $width / $height;
    var sideLength = 0, height = 0, widthOffset = 40,maskWidth,maskHeigth;
    sideLength = windowWidth - widthOffset
    this.setData({
      imageWidth: sideLength,
      imageHeight: sideLength / scale,
      $width : $width,
      $height : $height
    })
    if ($width > $height) {
      sideLength = this.data.imageHeight - widthOffset;
    }
    this.setData({
      maskLeft: (windowWidth -this.data.imageWidth)/2 ,
      maskTop: (windowHeight - this.data.imageHeight)/2 ,
      maskWidth: sideLength - 2 + 'px',
      maskHeight: sideLength - 2 + 'px',
      maskDisplay : 'block'
    })
  },
  maskMove : function(e){
    this.setData({
      maskLeft : e.detail.x,
      maskTop : e.detail.y
    })
  },
  maskScale : function(e){
    this.setData({
      maskLeft: e.detail.x,
      maskTop: e.detail.y,
      scale : e.detail.scale
    })
  },
  clip : function(){
    var canvas = wx.createCanvasContext('canvas');
    canvas.drawImage(this.data.photoUrl, 0, 0, this.data.imageWidth, this.data.imageHeight);
    canvas.draw();
    wx.canvasToTempFilePath({
      x: this.data.maskLeft ,
      y: this.data.maskTop,
      width : 315 * this.data.scale ,
      height : 315 * this.data.scale,
      canvasId : 'canvas',
      success : (res) =>{
        console.log(res.tempFilePath);
        this.setData({ cropUrl : res.tempFilePath})
        wx.navigateTo({
          url: '/pages/index/index?avatarUrl='+ res.tempFilePath,
        })
      },
      fail : function(err){
        console.log(err)
      }
    })
  }
})