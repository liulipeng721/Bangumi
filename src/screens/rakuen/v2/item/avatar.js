/*
 * @Author: czy0729
 * @Date: 2021-01-21 17:49:01
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-17 12:54:26
 */
import React from 'react'
import { View } from 'react-native'
// import { Heatmap } from '@components'
import { Avatar as CompAvatar } from '@screens/_'
import { _ } from '@stores'
import { obc } from '@utils/decorators'

const event = {
  id: '超展开.跳转'
}

function Avatar({ avatar, userName, userId }, { navigation }) {
  return (
    <View style={styles.image}>
      <CompAvatar
        navigation={navigation}
        src={avatar}
        name={userName}
        userId={userId}
        event={event}
      />
      {/* <Heatmap
        right={-12}
        id='超展开.跳转'
        data={{
          to: 'Zone',
          alias: '空间'
        }}
      /> */}
    </View>
  )
}

export default obc(Avatar)

const styles = _.create({
  image: {
    marginTop: _.md
  }
})
