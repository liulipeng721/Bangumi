/*
 * @Author: czy0729
 * @Date: 2020-11-30 15:39:12
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-04-12 17:37:41
 */
import React from 'react'
import { View } from 'react-native'
import { IconHeader } from '@screens/_'
import { _ } from '@stores'
import { inject, withHeader, obc } from '@utils/decorators'
import { t } from '@utils/fetch'
import { withHeaderParams } from '../styles'
import StatusBarEvents from '../_/status-bar-events'
import List from './list'
import Btn from './btn'
import Store from './store'

const title = '粘贴板'

export default
@inject(Store)
@withHeader({
  screen: title,
  hm: ['tinygrail/clipboard', 'TinygrailClipboard'],
  withHeaderParams
})
@obc
class TinygrailClipboard extends React.Component {
  async componentDidMount() {
    const { $, navigation } = this.context
    $.init(navigation)

    navigation.setParams({
      extra: (
        <>
          <IconHeader
            name='md-refresh'
            color={_.colorTinygrailPlain}
            size={22}
            onPress={() => {
              t('粘贴板.刷新')
              $.init()
            }}
          />
          <IconHeader
            style={_.mr._right}
            name='md-ios-share'
            color={_.colorTinygrailPlain}
            onPress={() => {
              t('粘贴板.分享')
              $.onShare()
            }}
          />
        </>
      )
    })
  }

  render() {
    return (
      <View style={this.styles.container}>
        <StatusBarEvents />
        <List />
        <Btn />
      </View>
    )
  }

  get styles() {
    return memoStyles()
  }
}

const memoStyles = _.memoStyles(_ => ({
  container: {
    flex: 1,
    backgroundColor: _.colorTinygrailContainer
  }
}))
