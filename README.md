# Introduction

My project is about digital hoarding, it is called Dopamine Hibernation. Simply put, we always save and collect lots of digital content. Our brains release short-lived, addictive dopamine. We mistakenly believe saving data on storage means we have learned it in our minds. But this false sense of security pushes us into real-world mental numbness. This interactive installation turns this modern-day psychological problem into something we can see and physically touch.

# Concept and Background Research

This project comes from the behavioural concept of “digital hoarding”. It was put forward in a psychiatric study in 2015. It is also nicknamed the “information squirrel syndrome”. In nature, squirrels store pine nuts to get through cold hard winters. In the old days when supplies were scarce, older generations stored physical goods against unknown risks. Now in the digital age, people save files, photos, courses and screenshots. We fight anxiety by collecting information, yet we get trapped by huge amounts of data.

# Technical Implementation

The whole work includes physical sandbox hardware, and two separate real-time visual systems: TouchDesigner and p5.js. I modelled the main visual asset in Blender. TouchDesigner does the rendering, and creates backgrounds and texts. p5.js handles the other set of visuals. This visual is projected onto the sandbox.

The hardware uses an ultrasonic distance sensor and pico board. When viewers get close to the sandbox, the ultrasonic sensor detects their distance. When people touch the surface of the installation, the touch sensor records how many times it is touched.

The Pico board collects data from the sensors and sends it out via the serial port. A middle-script inside VSCode receives this data. It then passes the values to both TouchDesigner and p5.js at the same time. The two visual systems receive the same physical input together.

# Reflection and Future Development

We are now living in an era of information explosion and popular AI tools. We keep chasing endless information anxiously, afraid of missing trends and falling behind the times. However, most of the time, we do not truly digest what we have collected.Short videos and fragmented information constantly reshape our cognition. Our brains are gradually trained to only adapt to short stimulation of just over ten seconds. We save and collect a huge number of materials crazily. It seems that we are accumulating knowledge, but in fact, we are only piling up useless information.

My work does not preach moral lessons or criticise people for saving and collecting materials. Instead, it acts as an experiential mirror. It amplifies this common daily behaviour into a complete sensory narrative. When audiences touch the installation, they trigger a bright, instant dopamine pleasure. Meanwhile, I have also reflected on my project. Currently, all the metaphors are only displayed on screen. In the future, I can turn the visual elements from TouchDesigner into physical objects. I plan to make the core brain image a real interactive piece. This can greatly improve the audience’s embodied experience.


# References 

Sweeten, G., Sillence, E. and Neave, N. (2018) ‘Digital hoarding behaviours: Underlying motivations and potential negative consequences’, Computers in Human Behavior, 85, pp. 54-60. Available at:  https://www.sciencedirect.com/science/article/abs/pii/S0747563218301365

van Bennekom, M.J., Blom, R.M., Vulink, N. and Denys, D. (2015) ‘A case of digital hoarding’, BMJ Case Reports, 2015. Available at: https://pubmed.ncbi.nlm.nih.gov/26452411/

Ikeda, R. (2011) the transfinite [Audiovisual installation]. Available at: https://www.ryojiikeda.com/project/thetransfinite/

Anadol, R. (2018) Melting memories [Data-driven audiovisual installation]. Pilevneli Gallery, Istanbul. Available at: https://refikanadol.com/works/melting-memories/

Brinkmann, C. (n.d.) Floral resonance [Interactive audiovisual installation]. Manar, PAAD Abu Dhabi. Available at: https://paad.ae/manar/artwork-detail/floral-resonance

