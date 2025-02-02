/*
 * @Author: czy0729
 * @Date: 2021-08-12 15:30:23
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-18 17:44:21
 */
import React from 'react'
import { Flex, Text, Touchable, Iconfont, Heatmap } from '@components'
import { _, systemStore } from '@stores'
import { SectionTitle, Rank } from '@screens/_'
import { open } from '@utils'
import { obc } from '@utils/decorators'
import { t } from '@utils/fetch'

function Title({ showScore }, { $ }) {
  rerender('Subject.Rating.Title')

  const { showRating } = systemStore.setting
  const { rank = '-' } = $.subject
  return (
    <SectionTitle
      right={
        showRating && (
          <Touchable
            style={styles.rate}
            onPress={() => {
              t('条目.跳转', {
                to: 'Netabare',
                from: '评分分布',
                subjectId: $.subjectId
              })
              open(`https://netaba.re/subject/${$.subjectId}`)
            }}
          >
            <Flex>
              {showScore && <Rank style={styles.rank} value={rank} size={13} />}
              <Text style={_.ml.sm} type='sub'>
                趋势
              </Text>
              <Iconfont name='md-navigate-next' />
            </Flex>
            <Heatmap
              id='条目.跳转'
              data={{
                from: '评分分布'
              }}
            />
          </Touchable>
        )
      }
      icon={!showRating && 'md-navigate-next'}
      onPress={() => $.switchBlock('showRating')}
    >
      评分{' '}
      {showScore && (
        <>
          <Text type='warning' size={18} lineHeight={18} bold>
            {' '}
            {$.rating.score}{' '}
          </Text>
          {!!$.rating.total && (
            <Text size={12} lineHeight={18} type='sub'>
              ({$.rating.total}人评分)
            </Text>
          )}
        </>
      )}
    </SectionTitle>
  )
}

export default obc(Title)

const styles = _.create({
  rate: {
    paddingLeft: _.xs,
    marginRight: -_.sm,
    borderRadius: _.radiusSm,
    overflow: 'hidden'
  },
  rank: {
    minWidth: 44 * _.ratio
  }
})
