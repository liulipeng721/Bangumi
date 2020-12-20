/*
 * @Author: czy0729
 * @Date: 2019-05-24 02:02:43
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-12-20 18:05:34
 */
import React from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react'
import { Touchable, Flex, Text, Iconfont } from '@components'
import { _ } from '@stores'

function ItemSetting({
  style,
  hd,
  ft,
  arrow,
  information,
  informationType,
  children,
  onPress,
  ...other
}) {
  const styles = memoStyles()
  const content = (
    <View style={styles.item}>
      <Flex>
        <Flex.Item>
          <Text type='title' size={16} bold>
            {hd}
          </Text>
        </Flex.Item>
        {typeof ft === 'string' ? <Text type='sub'>{ft}</Text> : ft}
        {arrow && <Iconfont style={_.ml.xs} size={14} name='right' />}
      </Flex>
      {information && (
        <Text style={styles.information} type={informationType} size={12}>
          {information}
        </Text>
      )}
      {children}
    </View>
  )

  if (onPress) {
    return (
      <Touchable style={[styles.touchable, style]} onPress={onPress} {...other}>
        {content}
      </Touchable>
    )
  }

  return (
    <View style={[styles.touchable, style]} {...other}>
      {content}
    </View>
  )
}

ItemSetting.defaultProps = {
  informationType: 'sub'
}

export default observer(ItemSetting)

const memoStyles = _.memoStyles(_ => ({
  touchable: {
    paddingLeft: _.wind,
    backgroundColor: _.colorPlain
  },
  item: {
    paddingVertical: _.md - 2,
    paddingRight: _.wind
  },
  information: {
    maxWidth: '80%',
    marginTop: _.xs
  }
}))
