/*
 * @Author: czy0729
 * @Date: 2021-07-09 23:30:20
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-07-29 14:11:24
 */
import React from 'react'
import { View } from 'react-native'
import WebView from '@components/@/web-view'
import { SafeAreaView } from '@screens/_'
import { _ } from '@stores'
import { withHeader, ob } from '@utils/decorators'
import { saveBase64ImageToCameraRoll } from '@utils/android'
import { loading, feedback, info } from '@utils/ui'
import { html } from './utils'

const title = '长按保存图片'

export default
@withHeader({
  screen: title
})
@ob
class WebViewShare extends React.Component {
  state = {
    captured: false
  }

  hide = null
  saved = false

  componentDidMount() {
    this.hide = loading('生成中...')
  }

  get source() {
    const { navigation } = this.props
    const { _url, _cover, _title, _content, _detail } = navigation.state.params
    return {
      html: html
        .replace(/\$url/g, _url)
        .replace(/\$cover/g, _cover)
        .replace(/\$title/g, _title)
        .replace(/\$content/g, _content)
        .replace(/\$detail/g, _detail)
    }
  }

  onMessage = async event => {
    try {
      const { type, data } = JSON.parse(event.nativeEvent.data)
      switch (type) {
        case 'captured':
          setTimeout(() => {
            this.setState({
              captured: true
            })

            if (this.hide) {
              this.hide()
              this.hide = null
            }
          }, 400)
          break

        case 'base64':
          if (data?.dataUrl) {
            if (this.saved) {
              info('已保存到相册')
              return
            }

            saveBase64ImageToCameraRoll(
              data.dataUrl,
              () => {
                this.saved = true
                info('已保存到相册')
                feedback()
              },
              () => {
                info('保存失败, 请确保给与读写权限')
              }
            )
          }
          break
        default:
          break
      }
    } catch (ex) {
      this.onError()
    }
  }

  render() {
    const { captured } = this.state
    return (
      <SafeAreaView style={_.container.flex}>
        <WebView
          originWhitelist={['*']}
          source={this.source}
          onMessage={this.onMessage}
        />
        {!captured && <View style={styles.mask} />}
      </SafeAreaView>
    )
  }
}

const styles = _.create({
  mask: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#fff'
  }
})
