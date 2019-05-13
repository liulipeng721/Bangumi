/*
 * @Author: czy0729
 * @Date: 2019-03-24 05:24:48
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-05-13 19:21:59
 */
import React from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Expand, Text } from '@components'
import { SectionTitle } from '@screens/_'
import _ from '@styles'

const Summary = ({ style }, { $ }) => {
  const { summary } = $.subject
  if (!summary) {
    return null
  }

  return (
    <View style={[_.container.wind, style]}>
      <SectionTitle>简介</SectionTitle>
      <Expand>
        <Text style={_.mt.sm} size={15} lineHeight={22}>
          {summary}
        </Text>
      </Expand>
    </View>
  )
}

Summary.contextTypes = {
  $: PropTypes.object
}

export default observer(Summary)
