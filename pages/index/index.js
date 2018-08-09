//index.js
//获取应用实例
const app = getApp()
var getImageSize = require('../../utils/util.js').getImageSize
var systemInfo = wx.getSystemInfoSync();
var windowHeight=  systemInfo.windowHeight,
    windowWidth = systemInfo.screenWidth,
    model = systemInfo.model;

Page({
  data: {
    staticServer: 'https://m.milaigame.com/football/',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    viewWitdh: 0,
    viewHeight: 0,
    windowHeight: 0,
    windowWidth: 0,
    startX : 0,
    left: 0,
    upladFilePath: null,
    isPhonex : false,
    topMargin : '50rpx',
    selectedIndex : 0,
    countries: ['france', 'croatia', 'england', 'belgium', 'russia', 'argentina', 'brazil', 'poland', 'portugal', 'spain', 'peru', 'switzerland', 'germany', 'columbia', 'mexico', 'uruguay', 'denmark', 'iceland', 'costaRica', 'sweden', 'tunisia', 'egypt', 'senegal', 'iran', 'serbia', 'nigeria', 'australia', 'korea', 'japan', 'panama', 'saudiArabia'],
    selectedCountry: 'france',
    canvasContext: null,
    cropCanvas : null
  },
  getImageSize : function(e) {
    var $width = e.detail.width,    //获取图片真实宽度  
      $height = e.detail.height,
      ratio = $width / $height,
      windowWidth = this.data.windowWidth,
      windowHeight = this.data.windowHeight,
      screeRatio = windowWidth / windowHeight;   
      console.log('origin image width',$width)
      console.log('origin image height',$height)
      console.log('screen width ',windowWidth)
      console.log('screen height ',windowHeight);

    var viewWidth = 750,           //设置图片显示宽度，  
      viewHeight = 750 / ratio;    //计算的高度值     
    this.setData({
      imageWidth: viewWidth,
      imageHeight: viewHeight
    })  
  },

  imageLoad: function (e) {
    this.getImageSize(e);
  },
  selectPhoto : function(){
    wx.navigateTo({
      url: '/pages/upload/preview?',
    })
  },
  
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  select : function(event){
    var country = event.target.dataset.country;
    var index = event.target.dataset.index;
    this.setData({selectedCountry : country,selectedIndex:index}); 
    wx.showLoading({title: '正在切换'})
    this.drawAvatar()
    this.drawAvatar(this.data.cropCanvas, 2)    
  },
  save : function(){
    wx.showLoading({
      title: '正在保存'
    })
    wx.canvasToTempFilePath({
      x : 0,
      y: 0,
      width: 315 * 2,
      height : 315 * 2,
      canvasId: 'crop-canvas',
      success: (res) => {
        var filePath = res.tempFilePath;
        wx.saveImageToPhotosAlbum({
          filePath: filePath,
          success: (res) => {
            wx.hideLoading()
            wx.showToast({
              title: '保存头像成功'
            })
          },
          fail: (err) => {
            wx.hideLoading();
            wx.showToast({
              title: '保存头像失败'
            })
          }
        })
      }
    })
  },
  onLoad: function (options) {
    if(options.avatarUrl){
      this.setData({
        hasUserInfo : true,
        userInfo : {
          avatarUrl : options.avatarUrl
        }
      })
    }
    this.setData({ 
      canvasContext: wx.createCanvasContext('flag'),
      cropCanvas: wx.createCanvasContext('crop-canvas'),
      windowHeight: windowHeight,
      windowWidth: windowWidth,
      isPhonex: model.search('iPhone X') != -1      
    })
    if(this.data.isPhonex){
      this.setData({
        topMargin : '100rpx'
      })
    }
    wx.showLoading({
      title: '正在获取头像',
    })
    if(this.data.hasUserInfo){
      this.drawAvatar();
      this.drawAvatar(this.data.cropCanvas,2)
    } else {
      wx.login({
        success : (res) => {
          console.log(res);
          if(res.code){
            wx.getUserInfo({
              success: result => {
                this.setData({
                  userInfo: result.userInfo,
                  hasUserInfo: true
                })
                this.drawAvatar();
                this.drawAvatar(this.data.cropCanvas, 2)                
              }
            })
          }
        }
      })
    }
  },
  drawAvatar : function(canvas,scale){
    var context = canvas || this.data.canvasContext;
    scale = scale || 1;

    //draw flag
    var flag = this.data.staticServer + 'flag/' + this.data.selectedCountry + '.png';
    
    wx.downloadFile({
      url : flag,
      fail : (err) => {
        wx.showModal({
          title: 'err',
          content : '获取图片失败，请关闭重新打开'
        })
      },
      success : (res) => {
        if(res.statusCode === 200) {
          context.drawImage(res.tempFilePath, (this.data.windowWidth - (315 / 2) * scale) / 2, 0, (315 / 2) * scale, (315 / 2) * scale, (315 / 2) * scale);
          context.save();
          
          //draw cup
          var cup = this.data.staticServer + 'cup.png';
          wx.downloadFile({
            url: cup,
            success: (res) => {
              if(res.statusCode === 200) {
                console.log('cup : ' + cup)
                context.drawImage(res.tempFilePath, (this.data.windowWidth - 308 / 2 * scale)  / 2, 90 * scale, 21.5 * scale, 61.5 * scale);
                context.save();
              }
            }
          })

          //draw circle
          var circle = this.data.staticServer + 'circle.png'
          wx.downloadFile({
            url: circle,
            success: (res) => {
              if(res.statusCode === 200) {
                context.drawImage(res.tempFilePath, (this.data.windowWidth - 255 / 2 * scale)  / 2, 4 * scale, (255 / 2) * scale, (255 / 2) * scale)
                context.save();

                //draw avatar 
                var fill = (path) =>{
                  context.arc(this.data.windowWidth / 2, (315 - 180) * scale/ 2, 120 / 2 * scale, 0, Math.PI * 2, false);
                    // context.strokeStyle = '#ffd737'
                    // context.lineWidth = '10'
                    // context.stroke();
                    context.clip();
                    context.drawImage(path, (this.data.windowWidth - 255 / 2 * scale) / 2, 4 * scale, 255 / 2 * scale, 255 / 2 * scale);
                    context.save();
                    context.draw();
                    wx.hideLoading()
                }
                var avatar = this.data.userInfo.avatarUrl
                if (avatar != null && avatar.indexOf('https://') !== -1) {
                  wx.downloadFile({
                    url: avatar,
                    success: (res) => {
                      if(res.statusCode === 200){
                        fill(res.tempFilePath)
                      }
                    }
                  })    
                } else {
                  wx.getImageInfo({
                    src: avatar,
                    success : (res) => {
                      fill(res.path)
                    }
                  })
                }
                      
              }
            }
          })
        }
      }
    })

  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    this.drawAvatar();
    this.drawAvatar(this.data.cropCanvas, 2)    
  },
  onShareAppMessage :function(options){
    return {
      title: '邀请您的朋友一起来玩',
      path: '/pages/index/index',
      imageUrl: this.data.staticServer + 'share.jpeg'
    }
  }
})
