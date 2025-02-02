/*
 * @Author: czy0729
 * @Date: 2019-04-14 20:26:45
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-18 15:44:20
 */
import React from 'react'
import { Flex, Button, Heatmap } from '@components'
import { Popover } from '@screens/_'
import { _ } from '@stores'
import { obc } from '@utils/decorators'
import { MODEL_SUBJECT_TYPE } from '@constants/model'

function TabBarLeft({ onSelect }, { $ }) {
  rerender('User.TabBarLeft')

  const styles = memoStyles()
  const { subjectType } = $.state
  return (
    <Popover data={MODEL_SUBJECT_TYPE.data.map(item => item.title)} onSelect={onSelect}>
      <Flex style={styles.tabBarLeft} justify='center'>
        <Button style={styles.btn} type='ghostMain' size='sm'>
          {MODEL_SUBJECT_TYPE.getTitle(subjectType)}
        </Button>
      </Flex>
      <Heatmap id='我的.类型选择' />
    </Popover>
  )
}

export default obc(TabBarLeft)

const memoStyles = _.memoStyles(_ => ({
  tabBarLeft: {
    height: 42 * _.ratio,
    paddingLeft: _._wind * _.ratio,
    paddingRight: _.sm,
    marginTop: _.device(0, 2),
    backgroundColor: _.select(
      'transparent',
      _.deepDark ? _._colorPlain : _._colorDarkModeLevel1
    )
  },
  btn: {
    width: 48 * _.ratio,
    height: 24 * _.ratio,
    borderRadius: 16 * _.ratio
  }
}))
