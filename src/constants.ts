import { createTheme } from '@mantine/core'

// export const PAGE_REFERENCE_QUERY = `
//   [:find (pull ?b [:block/uuid :block/content :block/page {:block/refs [:block/name]}])
//    :in $ ?page-id
//    :where
//     [?b :block/page ?page-id]
//     [?b :block/refs ?t]
//   ]
// `

export const PAGE_REFERENCE_QUERY = `
[:find (pull ?b [:block/uuid :block/content :block/page {:block/refs [:block/name]}
                 {:block/parent ...}])
 :in $ ?page-id
 :where
  [?b :block/page ?page-id]
  [?b :block/refs ?t]
]
`

export const THEME = createTheme({
  primaryColor: 'darkTeal',
  primaryShade: 9,
  colors: {
    darkTeal: [
      '#ecfbfd',
      '#daf4f8',
      '#b0e8f2',
      '#85dded',
      '#66d3e9',
      '#56cde6',
      '#4ccae6',
      '#3eb2cd',
      '#2f9eb7',
      '#0d89a0',
    ],
  },
})
