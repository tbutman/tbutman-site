export type LabItem = {
  title: string
  status: 'working' | 'in progress'
  body: string
  hardware: string
}

export const labIntro =
  'Lately my evenings go to hardware: microcontrollers, 3D printing and small robots. AI models have made it much faster to learn a new field, and this is what has come out of it so far.'

// TODO(thomas): add home-lab equipment if it supports a story (3D printer, bench tools, the server
// that hosts this site).
export const lab: LabItem[] = [
  {
    title: 'Baby monitor',
    status: 'working',
    body: 'Live video and low-latency audio to any browser on the home network, with no cloud, app or account involved.',
    hardware: 'XIAO ESP32-S3 Sense',
  },
  {
    title: 'Breathalyser',
    status: 'working',
    body: 'A handheld alcohol tester with guided tests, calibration and history, plus the interface circuit that makes a 5 V sensor safe on a 3.3 V board.',
    hardware: 'M5StickS3 · Grove alcohol sensor',
  },
  {
    title: 'Universal remote',
    status: 'in progress',
    body: 'Learning and decoding infrared remotes, building toward a keyboard-driven remote for every device in the house.',
    hardware: 'M5StickS3 · Cardputer',
  },
  {
    title: 'Stack-chan',
    status: 'in progress',
    body: 'Building and extending an open-source, palm-sized AI companion robot, with conversation running on a local LLM module.',
    hardware: 'M5Stack · serial servos',
  },
]
