/*
 * @Author: czy0729
 * @Date: 2019-05-08 19:32:34
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-20 06:44:02
 */
import React from 'react'
import { Animated, View, Alert } from 'react-native'
import { Flex, Iconfont, Text, Heatmap } from '@components'
import { Popover, IconBack, Avatar } from '@screens/_'
import { _ } from '@stores'
import { open, copy } from '@utils'
import { obc } from '@utils/decorators'
import { HTMLDecode } from '@utils/html'
import { t } from '@utils/fetch'
import { info } from '@utils/ui'
import { IOS, HOST } from '@constants'
import Head from './head'
import { H_BG, H_HEADER } from './store'

function ParallaxImage({ scrollY, fixed }, { $, navigation }) {
  const styles = memoStyles()
  const { _image, _name } = $.params
  const { avatar = {}, nickname, id, username } = $.usersInfo
  const parallaxStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-H_BG, 0, H_BG - H_HEADER, H_BG],
          outputRange: [H_BG / 2, 0, -(H_BG - H_HEADER), -(H_BG - H_HEADER)]
        })
      }
    ]
  }

  // 安卓没有弹簧效果不需要形变
  if (IOS) {
    parallaxStyle.transform.push({
      scale: scrollY.interpolate({
        inputRange: [-H_BG, 0, H_BG],

        // -h: 2, 0: 1, h: 1 当scrollY在-h到0时, scale按照2-1的动画运动
        // 当scrollY在0-h时, scale不变. 可以输入任意数量对应的值, 但必须是递增或者相等
        outputRange: [2, 1, 1]
      })
    })
  }

  const data = ['浏览器查看', '复制链接', '复制分享', '发短信', 'TA的收藏', 'TA的好友']
  if ($.users.connectUrl) {
    data.push('加为好友')
  } else if ($.users.disconnectUrl) {
    data.push('解除好友')
  }

  let uri = avatar.large
  if (_image) {
    if (_image?.indexOf('http') === 0) {
      uri = _image
    } else {
      uri = `https:${_image}`
    }
  }
  uri = $.bg || uri
  if (typeof uri === 'string') {
    uri = uri.replace('http://', 'https://')
  }

  const blurRadius = (IOS ? 2 : 1) - ($.bg ? 1 : 0)
  return (
    <>
      <View style={styles.parallax} pointerEvents={fixed ? 'none' : undefined}>
        <Animated.Image
          style={[styles.parallaxImage, parallaxStyle]}
          source={{
            uri
          }}
          blurRadius={blurRadius}
        />
        <Animated.View
          style={[
            styles.parallaxMask,
            parallaxStyle,
            {
              backgroundColor: _.select('rgba(0, 0, 0, 0.48)', 'rgba(0, 0, 0, 0.64)'),
              opacity: scrollY.interpolate({
                inputRange: [-H_BG, 0, H_BG - H_HEADER, H_BG],
                outputRange: _.select([0, 0.4, 1, 1], [0.4, 0.8, 1, 1])
              })
            }
          ]}
        />
        <Animated.View
          style={[
            styles.parallaxMask,
            parallaxStyle,
            {
              opacity: scrollY.interpolate({
                inputRange: [-H_BG, 0, H_BG - H_HEADER, H_BG],
                outputRange: [0, 0, 1, 1]
              })
            }
          ]}
        >
          <Flex style={styles.title} justify='center'>
            <Avatar size={28} src={$.src} />
            <Text
              style={_.ml.sm}
              type={_.select('plain', 'title')}
              align='center'
              bold
              numberOfLines={1}
            >
              {HTMLDecode(nickname || _name)}
            </Text>
          </Flex>
        </Animated.View>
        <Animated.View
          style={[
            styles.parallaxMask,
            parallaxStyle,
            {
              opacity: scrollY.interpolate({
                inputRange: [-H_BG, 0, H_BG - H_HEADER, H_BG],
                outputRange: [1, 1, 0, 0]
              })
            }
          ]}
        >
          <Head style={styles.head} />
        </Animated.View>
      </View>
      <IconBack
        style={[_.header.left, styles.btn]}
        navigation={navigation}
        color={_.__colorPlain__}
      />
      <View style={[_.header.right, styles.touch]}>
        <Popover
          data={data}
          onSelect={key => {
            t('空间.右上角菜单', {
              key,
              userId: $.userId
            })

            const url = `${HOST}/user/${username}`
            const userName = HTMLDecode(nickname || _name)
            switch (key) {
              case '浏览器查看':
                open(url)
                break

              case '复制链接':
                copy(url)
                info('已复制链接')
                break

              case '复制分享':
                copy(`【链接】${userName} | Bangumi番组计划\n${url}`)
                info('已复制分享文案')
                break

              case '发短信':
                navigation.push('PM', {
                  userId: id, // 必须是数字id
                  userName
                })
                break

              case 'TA的收藏':
                $.toUser(navigation)
                break

              case 'TA的好友':
                navigation.push('Friends', {
                  userId: username || id
                })
                break

              case '加为好友':
                $.doConnectFriend()
                break

              case '解除好友':
                setTimeout(() => {
                  Alert.alert('警告', '确定解除好友?', [
                    {
                      text: '取消',
                      style: 'cancel'
                    },
                    {
                      text: '确定',
                      onPress: () => $.doDisconnectFriend()
                    }
                  ])
                }, 400)
                break

              default:
                break
            }
          }}
        >
          <Flex style={styles.icon} justify='center'>
            <Iconfont name='md-menu' color={_.__colorPlain__} />
          </Flex>
          <Heatmap id='空间.右上角菜单' />
          <Heatmap right={62} id='空间.添加好友' transparent />
          <Heatmap right={113} id='空间.解除好友' transparent />
          <Heatmap
            right={170}
            id='空间.跳转'
            data={{
              to: 'WebBrowser',
              alias: '浏览器'
            }}
            transparent
          />
        </Popover>
      </View>
    </>
  )
}

export default obc(ParallaxImage)

const memoStyles = _.memoStyles(_ => ({
  parallax: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    right: 0,
    left: 0
  },
  parallaxImage: {
    marginTop: -8,
    height: H_BG + 8
  },
  parallaxMask: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: -_.hairlineWidth,
    left: 0
  },
  head: {
    marginTop: 76
  },
  title: {
    position: 'absolute',
    left: '50%',
    width: 240,
    bottom: _.sm + 4,
    transform: [
      {
        translateX: -120
      }
    ]
  },
  tabs: {
    position: 'absolute',
    zIndex: 2,
    left: 0,
    right: 0
  },
  collection: {
    ..._.header.right,
    zIndex: 1,
    marginTop: -5,
    marginRight: 34,
    opacity: 0.88
  },
  btn: {
    zIndex: 1,
    marginTop: -5
  },
  touch: {
    zIndex: 1,
    marginTop: -4,
    borderRadius: 20,
    overflow: 'hidden'
  },
  icon: {
    width: 36,
    height: 36
  }
}))
