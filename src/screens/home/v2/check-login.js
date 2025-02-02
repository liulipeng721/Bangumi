/*
 * @Author: czy0729
 * @Date: 2021-01-21 17:03:54
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-16 10:27:46
 */
import React from 'react'
import { NavigationEvents } from 'react-navigation'
import { obc } from '@utils/decorators'

function CheckLogin(props, { $, navigation }) {
  rerender('Home.CheckLogin')

  return (
    <NavigationEvents
      onWillFocus={() => {
        // popToTop回来时需要延时才能获得正确的登出后的isLogin状态
        setTimeout(() => {
          if (!$.isLogin) {
            navigation.navigate('Auth')
          }
        }, 800)

        const { _loaded } = $.state
        if (!_loaded) {
          $.init()
        }
      }}
    />
  )
}

export default obc(CheckLogin)
