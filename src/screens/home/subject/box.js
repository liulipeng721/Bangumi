/*
 * @Author: czy0729
 * @Date: 2019-03-23 09:16:00
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-20 07:15:56
 */
import React from 'react'
import { View } from 'react-native'
import { Flex, Button, Icon, Text, Touchable, Heatmap } from '@components'
import { SectionTitle } from '@screens/_'
import { _ } from '@stores'
import { getType, getRating } from '@utils/app'
import { obc, memo } from '@utils/decorators'
import { IOS } from '@constants'
import IconFolder from './icon/folder'
import IconClose from './icon/close'

const RATE = [1, 2, 3, 4, 5]
const defaultProps = {
  styles: {},
  navigation: {},
  collection: {},
  collectionStatus: '未收藏',
  isLogin: false,
  status: [],
  showManageModel: Function.prototype,
  toRating: Function.prototype
}

const Box = memo(
  ({
    styles,
    navigation,
    collection,
    collectionStatus: userCollectionStatus,
    isLogin,
    status,
    showManageModel,
    toRating
  }) => {
    rerender('Subject.Box.Main')

    // 自己的收藏状态
    const {
      status: collectionStatus = { name: '未收藏' },
      rating = 0,
      _loaded
    } = collection
    const leftStyle = []
    const rightStyle = []
    if (rating) {
      leftStyle.push(styles.left)
      rightStyle.push(styles.right)
    }

    let btnText = '登陆管理'
    if (isLogin) {
      if (!_loaded) {
        btnText = userCollectionStatus || collectionStatus.name
      } else {
        btnText = collectionStatus.name
      }
    }

    const onPress = isLogin ? showManageModel : () => navigation.push('LoginV2')
    const statusSize = status[status.length - 1]?.text.length >= 6 ? 11 : 12
    return (
      <View style={styles.container}>
        <SectionTitle
          style={styles.sectionTitle}
          right={
            <>
              <IconFolder />
              <IconClose />
            </>
          }
        >
          收藏
        </SectionTitle>
        <Touchable style={styles.btn} onPress={onPress}>
          <Flex justify='center'>
            <Flex.Item>
              <Button style={leftStyle} type={getType(btnText)}>
                {btnText}
              </Button>
            </Flex.Item>
            {!!rating && (
              <Flex.Item>
                <Button style={rightStyle} type={getType(btnText)}>
                  {getRating(rating)}{' '}
                  {RATE.map(item => {
                    let type
                    if (rating / 2 >= item) {
                      type = 'ios-star'
                    } else if (rating / 2 >= item - 0.5) {
                      type = 'ios-star-half'
                    } else {
                      type = 'ios-star-outline'
                    }
                    return (
                      <Icon key={item} name={type} size={16} color={_.__colorPlain__} />
                    )
                  })}
                </Button>
              </Flex.Item>
            )}
          </Flex>
          <Heatmap id='条目.管理收藏' />
          <Heatmap right={56} transparent id='条目.显示收藏管理' />
        </Touchable>
        <View style={_.mt.md}>
          <Text size={statusSize} type='sub'>
            {status.map((item, index) => (
              <Text
                key={item.status}
                size={statusSize}
                type='sub'
                onPress={() => toRating(navigation, '收藏', item.status)}
              >
                {!!index && ' / '}
                {item.text}
              </Text>
            ))}
          </Text>
          <Heatmap
            id='条目.跳转'
            data={{
              from: '收藏'
            }}
          />
        </View>
      </View>
    )
  },
  defaultProps
)

export default obc((props, { $, navigation }) => {
  rerender('Subject.Box')
  return (
    <Box
      styles={memoStyles()}
      navigation={navigation}
      collection={$.collection}
      collectionStatus={$.params._collection}
      isLogin={$.isLogin}
      status={$.status}
      showManageModel={$.showManageModel}
      toRating={$.toRating}
    />
  )
})

const memoStyles = _.memoStyles(_ => ({
  container: {
    minHeight: 120,
    paddingHorizontal: _.wind,
    marginTop: _.lg - 4
  },
  sectionTitle: {
    height: 28
  },
  btn: {
    marginTop: _.md,
    backgroundColor: _.colorPlain,
    borderRadius: _.radiusSm,
    shadowColor: _.colorShadow,
    shadowOffset: {
      height: 3
    },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 3,
    overflow: IOS ? undefined : 'hidden'
  },
  left: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  right: {
    marginLeft: -_.hairlineWidth,
    borderLeftWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0
  }
}))
