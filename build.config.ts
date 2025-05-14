import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/http',
    'src/ws',
    'src/config',
    'src/types',
  ],
  clean: true,
  declaration: 'node16',
  rollup: {
    emitCJS: true,
  },
})
