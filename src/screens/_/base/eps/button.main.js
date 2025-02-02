/*
 * @Author: czy0729
 * @Date: 2021-08-10 00:59:08
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-10 20:21:22
 */
import React from 'react'
import { View } from 'react-native'
import { Popover, Button as CompButton, Menu } from '@components'
import { _ } from '@stores'
import { memo } from '@utils/decorators'
import { IOS } from '@constants'
import { buttonDefaultProps as defaultProps } from './ds'

function Button({ styles, heatMap, props, item, eps, isSp, num }) {
  rerender('Eps.Button.Main')

  const {
    subjectId,
    width,
    margin,
    numbersOfLine,
    canPlay,
    login,
    advance,
    userProgress,
    onSelect,
    onLongPress
  } = props
  const isSide = num % numbersOfLine === 0
  const type = getType(userProgress[item.id], item.status)

  const popoverData = getPopoverData(
    item,
    isSp,
    canPlay,
    login,
    advance,
    userProgress
  )
  let popoverProps
  if (IOS) {
    popoverProps = {
      overlay: (
        <Menu
          title={[
            `ep.${item.sort} ${item.name_cn || item.name}`,
            `${item.airdate} 讨论数：${item.comment}`
          ]}
          data={popoverData}
          onSelect={value => onSelect(value, item)}
        />
      )
    }
  } else {
    popoverProps = {
      data: popoverData,
      onSelect: value => onSelect(value, item, subjectId)
    }
  }

  const { min, max } = getComment(eps)
  return (
    <Popover
      style={{
        marginRight: _.device(isSide ? 0 : margin, margin),
        marginBottom: margin + 4
      }}
      onLongPress={() => onLongPress(item)}
      {...popoverProps}
    >
      <CompButton
        type={type}
        size='sm'
        style={{
          width,
          height: width
        }}
      >
        {item.sort}
      </CompButton>
      {heatMap && (
        <View
          style={[
            styles.bar,
            {
              opacity: (item.comment - min / 1.68) / max // 1.68是比率, 增大少回复与高回复的透明度幅度
            }
          ]}
        />
      )}
    </Popover>
  )
}

export default memo(Button, defaultProps, ({ props, item, eps, isSp, num }) => {
  const { userProgress = {}, ...otherProps } = props
  return {
    props: otherProps,
    userProgress: userProgress[item.id],
    item,
    eps: eps.length,
    isSp,
    num
  }
})

function getPopoverData(item, isSp, canPlay, login, advance, userProgress) {
  let discuss
  if (IOS) {
    discuss = '本集讨论'
  } else {
    discuss = `(+${item.comment}) ${item.name_cn || item.name || '本集讨论'}`
  }

  let data
  if (login) {
    data = [userProgress[item.id] === '看过' ? '撤销' : '看过']
    if (!isSp) data.push('看到')
    if (advance) data.push('想看', '抛弃')
    data.push(discuss)
  } else {
    data = [discuss]
  }

  if (canPlay) data.push('在线播放')

  return data
}

function getType(progress, status) {
  switch (progress) {
    case '想看':
      return 'main'
    case '看过':
      return 'primary'
    case '抛弃':
      return 'disabled'
    default:
      break
  }

  switch (status) {
    case 'Air':
      return 'ghostPlain'
    case 'Today':
      return 'ghostSuccess'
    default:
      return 'disabled'
  }
}

function getComment(eps) {
  return {
    min: Math.min(...eps.map(item => item.comment || 1).filter(item => !!item)),
    max: Math.max(...eps.map(item => item.comment || 1))
  }
}
