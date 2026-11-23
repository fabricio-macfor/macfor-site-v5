import sys,glob
from PIL import Image
pat,out=sys.argv[1],sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 3; W=int(sys.argv[4]) if len(sys.argv)>4 else 640
fs=sorted(glob.glob(pat)); ims=[Image.open(f) for f in fs]
h=int(ims[0].height*W/ims[0].width); rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(W*cols,h*rows),'#222')
for i,im in enumerate(ims): sh.paste(im.resize((W,h)),((i%cols)*W,(i//cols)*h))
sh.save(out,quality=80); print(len(fs),sh.size)
