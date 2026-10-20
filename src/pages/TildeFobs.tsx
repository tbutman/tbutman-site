import { fobs } from '../content/booth/fobs'
import BoothStation from './BoothStation'

// /tilde/fobs: the booth's fobs station (taptilde.com/fobs). English only (tilde-review/briefs/booth-site.md).
export default function TildeFobs() {
  return <BoothStation station={fobs} />
}
