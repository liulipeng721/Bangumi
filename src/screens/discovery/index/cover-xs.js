/*
 * @Author: czy0729
 * @Date: 2020-11-19 10:51:04
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-18 13:41:06
 */
import React from 'react'
import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Flex, Text } from '@components'
import { Cover, Avatar } from '@screens/_'
import { _, systemStore } from '@stores'
import { memo, obc } from '@utils/decorators'
import { HTMLDecode } from '@utils/html'
import { t } from '@utils/fetch'
import { linearColor } from './ds'

const imageWidth = _.device(_.window.width * 0.34, _.window.contentWidth * 0.4) * 0.5625
const imageHeight = imageWidth * 1.38
const avatarSize = 24
const defaultProps = {
  navigation: {},
  styles: {},
  avatarRound: false,
  title: '',
  avatar: '',
  data: {}
}

const CoverXs = memo(({ navigation, styles, avatarRound, title, avatar, data }) => {
  rerender('Discovery.CoverXs.Main')

  return (
    <View>
      <View style={styles.item}>
        <Cover
          src={data.cover}
          width={imageWidth}
          height={imageHeight}
          radius
          placeholder={false}
          onPress={() => {
            t('发现.跳转', {
              to: 'Subject',
              from: title,
              type: 'xs',
              subjectId: data.id
            })

            navigation.push('Subject', {
              subjectId: data.id,
              _jp: data.name,
              _image: data.cover
            })
          }}
        />
        <LinearGradient
          style={styles.linear}
          colors={linearColor}
          pointerEvents='none'
        />
        <Text
          style={styles.desc}
          size={8}
          type={_.select('plain', 'title')}
          numberOfLines={2}
          bold
          pointerEvents='none'
        >
          {HTMLDecode(data.name)}
        </Text>
      </View>
      {!!avatar && (
        <Flex
          style={[
            styles.fixed,
            {
              borderRadius: avatarRound ? 28 : _.radiusSm
            }
          ]}
          justify='center'
        >
          <Avatar
            navigation={navigation}
            style={styles.avatar}
            size={avatarSize}
            src={avatar}
            userId={data.userId}
            name={data.userName}
            borderColor='transparent'
          />
        </Flex>
      )}
    </View>
  )
}, defaultProps)

export default obc(({ title, avatar, data }, { navigation }) => {
  rerender('Discovery.CoverXs')

  const { avatarRound } = systemStore.setting
  return (
    <CoverXs
      navigation={navigation}
      styles={memoStyles()}
      avatarRound={avatarRound}
      title={title}
      avatar={avatar}
      data={data}
    />
  )
})

const memoStyles = _.memoStyles(_ => ({
  item: {
    marginRight: _._wind + 2,
    borderRadius: _.radiusSm,
    overflow: 'hidden'
  },
  linear: {
    position: 'absolute',
    zIndex: 1,
    height: 64,
    right: 0,
    bottom: 0,
    left: 0,
    marginBottom: -0.5,
    borderBottomRightRadius: _.radiusSm,
    borderBottomLeftRadius: _.radiusSm
  },
  desc: {
    position: 'absolute',
    zIndex: 2,
    right: 2,
    bottom: 4,
    left: avatarSize + 2,
    opacity: 0.92
  },
  fixed: {
    position: 'absolute',
    zIndex: 2,
    bottom: 0,
    left: 0,
    width: 28,
    height: 28,
    marginLeft: -6,
    marginBottom: -2,
    backgroundColor: _.select(_.colorPlain, _.colorBg)
  },
  avatar: {
    backgroundColor: _.select(_.colorPlain, _.colorBg)
  }
}))
