import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/http',
    'src/types/index',
  ],
  clean: true,
  declaration: 'node16',
})
