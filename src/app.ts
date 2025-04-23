import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {

  useLaunch(() => {
    // 使用callContainer前一定要init一下，全局执行一次即可
    wx.cloud.init()
    console.log('App launched.')
  })

  // children 是将要会渲染的页面
  return children
}

export default App
