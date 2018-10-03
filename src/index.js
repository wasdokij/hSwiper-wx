import HTouch from './libs/hTouch'
import {parseStyle, styleStringify} from './libs/utils'

const touchHandle = new HTouch()
const systemInfo = wx.getSystemInfoSync()
const SCREEN_WIDTH = systemInfo.windowWidth
const SCREEN_HEIGHT = systemInfo.windowHeight
/* 动画过渡时间 */
let DURATION = 300
// 视图过度动画实例
const VIEWANI_MATION = wx.createAnimation({
  transformOrigin: '50% 50%',
  duration: DURATION,
  timingFunction: 'ease',
  delay: 0
})
// 视图移动动画实例
const MOVE_ANIMATION = wx.createAnimation({
  transformOrigin: '50% 50%',
  duration: 0,
  timingFunction: 'ease',
  delay: 0
})
/* 触摸句柄 */
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  externalClasses: ['wrap-container'],
  data: {
    /* 每个元素的宽度 */
    itemWidth: SCREEN_WIDTH,
    /* 每个元素的高度 */
    itemHeight: SCREEN_HEIGHT,
    swiperAnmiation: {},
    wrapperStyle: '',
    itemStyle: '',
    nowViewDataIndex: 0,
    nowTranX: 0,
    nowTranY: 0,
    visableDataList: [],
    /* 最外层可是区域盒子的样式 */
    viewBoxStyle: ''
  },
  properties: {
    templateName: {
      type: String,
      value: 'hSwiperItem'
    },
    /* 传入的数据 */
    dataList: {
      type: Array,
      value: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    initIndex: {
      type: Number,
      default: 0,
      observer(newVal) {
        if (!this.data.dataList.length) {
          return
        }
        let maxIndex = this.data.dataList.length - 1

        let val = newVal > maxIndex ? maxIndex : newVal
        val = val < 0 ? 0 : newVal
        this.setData({
          nowViewDataIndex: val
        })
      }
    },
    /* 滚动图的宽度 */
    width: {
      type: Number,
      value: SCREEN_WIDTH,
      observer(newVal) {
        let tempReduceDistance = (this.data.reduceDistance + this.data.reduceDistanceX) * 2
        this.setData({
          itemWidth: newVal - tempReduceDistance
        })
      }
    },
    /* 滚动图的高度 */
    height: {
      type: Number,
      value: SCREEN_HEIGHT,
      observer(newVal) {
        let tempReduceDistance = (this.data.reduceDistance + this.data.reduceDistanceY) * 2
        this.setData({
          itemHeight: newVal - tempReduceDistance
        })
      }
    },
    /* 垂直和水平方向各自减少的距离 */
    reduceDistance: {
      type: Number,
      value: 0,
      observer(newVal) {
        let tempReduceDistanceX = (newVal + this.data.reduceDistanceX) * 2
        let tempReduceDistanceY = (newVal + this.data.reduceDistanceY) * 2
        this.setData({
          itemWidth: this.data.width - tempReduceDistanceX,
          itemHeight: this.data.height - tempReduceDistanceY
        })
      }
    },
    /* 水平方向减少的距离 */
    reduceDistanceX: {
      type: Number,
      value: 0,
      observer(newVal) {
        let tempReduceDistanceX = (newVal + newVal) * 2
        let tempReduceDistanceY = (newVal + this.data.reduceDistanceY) * 2
        this.setData({
          itemWidth: this.data.width - tempReduceDistanceX,
          itemHeight: this.data.height - tempReduceDistanceY
        })
      }
    },
    /* 垂直方向减少的距离 */
    reduceDistanceY: {
      type: Number,
      value: 0,
      observer(newVal) {
        let tempReduceDistanceX = (newVal + this.data.reduceDistanceY) * 2
        let tempReduceDistanceY = (newVal + newVal) * 2
        this.setData({
          itemWidth: this.data.width - tempReduceDistanceX,
          itemHeight: this.data.height - tempReduceDistanceY
        })
      }
    },
    /* 是否为垂直 */
    vertical: {
      type: Boolean,
      value: false
    },
    /* 是否循环 */
    recycle: {
      type: Boolean,
      value: false
    },
    /* 是否自动播放 */
    autoPlay: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    touchstart: touchHandle.touchstart.bind(touchHandle),
    touchmove: touchHandle.touchmove.bind(touchHandle),
    touchend: touchHandle.touchend.bind(touchHandle),
    registerTouchEvent() {
      let {vertical} = this.data
      if (!vertical) {
        touchHandle.listen('touchleft', (data) => {
          this.nextView()
          console.log(data.type)
        })
        touchHandle.listen('touchright', (data) => {
          this.preView()
          console.log(data.type)
        })
        touchHandle.listen('touchmove', (data) => {
          console.log('data touchmove', data)
          console.log(data.type)
        })
        return
      }
      /* 垂直方向滚动 */
      touchHandle.listen('touchup', (data) => {
        this.nextView()
        console.log(data.type)
      })

      touchHandle.listen('touchdown', (data) => {
        this.preView()
        console.log(data.type)
      })
      touchHandle.listen('touchmove', (data) => {
        console.log('data touchmove', data)
        console.log(data.type)
        this.movePos(data.startY - data.endY)
      })
    },
    /**
     * 动态更新指定样式属性变量的值
     * @param {*} attr 样式属性名
     * @param {*} val 样式属性值
     * @param {*} styleName 样式变量
     */
    updateDomStyle(styleObj, styleName) {
      let {itemStyle} = this.data
      let style = parseStyle(itemStyle)
      style = Object.assign(style, styleObj)
      this.setData({
        [styleName]: styleStringify(style)
      })
      console.log(this.data)
    },
    /* 初始化dom 结构 */
    initStruct() {
      let {
        itemHeight, itemWidth, vertical, width, height
      } = this.data
      let h = 0
      let w = 0
      let count = 5
      let viewBoxStyle = {
        width: width + 'px',
        height: height + 'px'
      }
      if (vertical) {
        w = itemWidth + 'px'
        h = count * itemHeight + 'px'
        viewBoxStyle['padding-left'] = (width - itemWidth) / 2 + 'px'
      } else {
        w = count * itemWidth + 'px'
        h = itemHeight + 'px'
        viewBoxStyle['padding-top'] = (height - itemHeight) / 2 + 'px'
      }
      // 更新容器的宽度，默认
      this.updateDomStyle({
        width: w,
        height: h
      }, 'wrapperStyle')
      this.updateDomStyle({
        width: itemWidth + 'px',
        height: itemHeight + 'px'
      }, 'itemStyle')

      this.updateDomStyle(viewBoxStyle, 'viewBoxStyle')
    },
    /* 计算可视区域元素，用于正常情况下的条状 */
    calViasbleDataList() {
      /* 区分是否支持循环滚动 */
      let res = []
      let {dataList, nowViewDataIndex} = this.data
      let dataCount = dataList.length
      let pre1 = (dataCount + (nowViewDataIndex - 1)) % dataCount
      let pre2 = (dataCount + (nowViewDataIndex - 2)) % dataCount
      let next1 = (nowViewDataIndex + 1) % dataCount
      let next2 = ((nowViewDataIndex + 2)) % dataCount
      res[0] = dataList[pre2]
      res[1] = dataList[pre1]
      res[2] = dataList[nowViewDataIndex]
      res[3] = dataList[next1]
      res[4] = dataList[next2]
      if (!this.data.recycle) {
        let emptyElement = {
          templateName: '_hswiper_emptyItem'
        }
        if (nowViewDataIndex === 0) {
          res[1] = emptyElement
          res[0] = emptyElement
        } else if (nowViewDataIndex === (dataCount - 1)) {
          res[3] = emptyElement
          res[4] = emptyElement
        }
      }
      this.setData({
        visableDataList: res
      })
    },
    /**
     * @description 移动到指定dom index 位置
     * @param {*} domIndex dom元素的index
     * @param {*} useAnimation 是否启用过渡动画
     */
    moveViewTo(domIndex, useAnimation) {
      let {
        itemWidth, itemHeight, vertical, reduceDistance, reduceDistanceX, reduceDistanceY
      } = this.data
      let pos = 0
      let attr = 'translateX'
      /* 垂直方向 */
      if (vertical) {
        pos = -domIndex * itemHeight + reduceDistance + reduceDistanceX
        attr = 'translateY'
      } else {
        /* 水平方向 */
        pos = -domIndex * itemWidth + reduceDistance + reduceDistanceY
        attr = 'translateX'
      }

      /* 是否启用动画过渡 */
      if (useAnimation) {
        VIEWANI_MATION[attr](pos).translate3d(0).step()
        this.setData({
          swiperAnmiation: VIEWANI_MATION.export()
        })
      } else {
        MOVE_ANIMATION[attr](pos).translate3d(0).step()
        this.setData({
          swiperAnmiation: MOVE_ANIMATION.export()
        })
      }

      let p = new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, DURATION)
      })
      return p
    },
    /* 向后一个视图 */
    nextView(useAnimation = true) {
      let {nowViewDataIndex, dataList} = this.data
      let len = dataList.length
      /* 当前是否已经是最后一个 */
      if (nowViewDataIndex === (len - 1)) {
        console.log('已经是最后一个')
        if (!this.data.recycle) {
          console.log('不循环滚动')
          return null
        }
      }

      if ((nowViewDataIndex + 1) === (len - 1)) {
        console.log('即将是最后一个')
      }

      return this.moveViewTo(3, useAnimation).then(() => {
        let nextIndex = nowViewDataIndex + 1
        let len = dataList.length
        nextIndex = Math.abs(nextIndex % len)
        this.setData({
          nowViewDataIndex: nextIndex
        })
        this.calViasbleDataList()
        this.moveViewTo(2)
        return null
      })
    },
    /* 向前一个视图 */
    preView(useAnimation = true) {
      let {nowViewDataIndex, dataList} = this.data
      /* 当前是否已经是第一个 */
      if (nowViewDataIndex === 0) {
        console.log('已经是第一个')
        if (!this.data.recycle) {
          console.log('不循环滚动')
          return null
        }
      }

      if ((nowViewDataIndex - 1) === 0) {
        console.log('即将是第一个')
      }
      return this.moveViewTo(1, useAnimation).then(() => {
        let nextIndex = nowViewDataIndex - 1
        let len = dataList.length
        nextIndex = Math.abs((nextIndex + len) % len)
        this.setData({
          nowViewDataIndex: nextIndex
        })
        this.calViasbleDataList()
        this.moveViewTo(2)
        return null
      })
    },
    /* 移动到指定像素位置 */
    movePos(pos) {
      let {
        vertical, viewAnimation, nowTranX, nowTranY
      } = this.data
      let nowTran = nowTranX
      let attr = 'translateX'
      if (vertical) {
        attr = 'translateY'
        nowTran = nowTranY
      } else {
        attr = 'translateX'
        nowTran = nowTranX
      }
      let tempPos = nowTran + pos
      let count = this.data.list.length > 0 ? (this.data.data.length) : 1
      let minPos = -this.itemWidth * (count - 1) - 40
      let maxPos = 40

      // 最大的位置
      if (tempPos > maxPos) {
        tempPos = maxPos
      }

      if (tempPos < minPos) {
        tempPos = minPos
      }
      viewAnimation[attr](pos).translate3d(0).step()
      this.setData({
        swiperAnmiation: this.data.viewAnimation.export()
      })
    }
  },
  lifetimes: {
    ready() {
      this.initStruct()
      this.registerTouchEvent()
      this.calViasbleDataList()
      this.moveViewTo(2)
    }
  },
  pageLifetimes: {}
})
