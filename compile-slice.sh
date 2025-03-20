
for file in $(find interfaces -name '*.ice') ; do
	prefix=`sed -e 's|^interfaces/||;s|[^/]\+\.ice$||;s|/|_|g' <<< $file`
	slice2py -Iinterfaces --prefix $prefix --underscore $file
done
