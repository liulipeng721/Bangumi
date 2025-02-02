/*
 * @Author: czy0729
 * @Date: 2020-11-19 10:44:09
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-18 12:11:29
 */
import React from 'react'
import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@components'
import { Cover } from '@screens/_'
import { _ } from '@stores'
import { obc } from '@utils/decorators'
import { HTMLDecode } from '@utils/html'
import { t } from '@utils/fetch'
import { linearColor } from './ds'

const imageWidth = _.device(_.window.width * 0.34, _.window.contentWidth * 0.4)
const imageHeight = imageWidth * 1.38

function CoverSm({ title, src, cn, data }, { navigation }) {
  rerender('Discovery.CoverSm')

  const styles = memoStyles()
  return (
    <View style={styles.item}>
      <Cover
        src={src}
        size={imageWidth}
        height={imageHeight}
        radius={_.radiusSm}
        placeholder={false}
        onPress={() => {
          t('发现.跳转', {
            to: 'Subject',
            from: title,
            type: 'sm',
            subjectId: data.subjectId
          })

          navigation.push('Subject', {
            subjectId: data.subjectId,
            _jp: data.title,
            _cn: cn,
            _image: src,
            _imageForce: src
          })
        }}
      />
      <LinearGradient style={styles.linear} colors={linearColor} pointerEvents='none' />
      <View style={styles.desc} pointerEvents='none'>
        <Text size={10} type={_.select('plain', 'title')} numberOfLines={1} bold>
          {data.info}
        </Text>
        <Text style={_.mt.xs} type={_.select('plain', 'title')} size={12} numberOfLines={2} bold>
          {HTMLDecode(cn)}
        </Text>
      </View>
    </View>
  )
}

export default obc(CoverSm)

const memoStyles = _.memoStyles(_ => ({
  item: {
    marginRight: _._wind + 2,
    backgroundColor: _.colorBg,
    borderRadius: _.radiusSm,
    overflow: 'hidden',
    ..._.shadow
  },
  linear: {
    position: 'absolute',
    zIndex: 1,
    height: 96,
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
    right: _._wind - 2,
    bottom: _.space - 2,
    left: _._wind - 2,
    opacity: 0.92
  }
}))
