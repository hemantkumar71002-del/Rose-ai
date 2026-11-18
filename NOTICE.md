# Third-Party Model and Software Notices

Rose AI loads the following third-party AI software and pretrained models at runtime from jsDelivr CDNs. These components are separate from this repository's Apache License 2.0 license; their respective license terms apply.

## TensorFlow.js

- **Component:** TensorFlow.js 4.22.0
- **Purpose:** Runs inference in the browser/on-device.
- **License:** Apache License 2.0
- **Source:** https://github.com/tensorflow/tfjs

## COCO-SSD object detection

- **Component:** `@tensorflow-models/coco-ssd` 2.2.3, loaded from jsDelivr.
- **Model configuration:** MobileNet V2 backbone (`base: "mobilenet_v2"`).
- **Purpose:** Object detection using the COCO-SSD pretrained model.
- **License:** Apache License 2.0 for the COCO-SSD software package. TensorFlow.js model code is also distributed under Apache License 2.0.
- **Source:** https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd

## face-api.js

- **Component:** `@vladmandic/face-api` 1.7.13, loaded from jsDelivr.
- **Model files:** Tiny Face Detector, Face Landmark 68, and Face Recognition weights, loaded from the package's `model/` directory.
- **Purpose:** Face detection, landmark detection, and face descriptor/recognition features.
- **License:** MIT for the face-api software package.
- **Source:** https://github.com/vladmandic/face-api
- **License text:** https://github.com/vladmandic/face-api/blob/master/LICENSE

The face-api package license identifies the software license; this repository does not independently establish the provenance or separate licensing of the pretrained model weights or their training data. The weights are fetched remotely rather than stored in this repository. Before redistributing those weight files separately, verify their current upstream notices and any applicable dataset/model terms.

## License and redistribution note

This notice records the components referenced by the repository's current `index.html`; it does not replace or alter any component's license. When redistributing the app or bundled assets, include the applicable license texts and preserve required attribution and notices. Model and package versions are pinned in the CDN URLs in `index.html`; check those upstream versions if the URLs change.
