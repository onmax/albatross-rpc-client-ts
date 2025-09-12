import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/http',
    'src/ws',
    'src/client',
    'src/types',
    'src/schemas',
    'src/json-schemas-exported',
  ],
  clean: true,
  declaration: 'node16',
  rollup: {
    emitCJS: true,
  },
})
