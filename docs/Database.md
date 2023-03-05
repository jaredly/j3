
# Colocated Database

## Inspiration

- subtext - jonathan edwards video
- eve https://futureofcoding.org/essays/eve/
- I should watch all of these videos https://vimeo.com/user27827062

I should try to use smalltalk in anger.
Also the lion programming language?

## More things


What if there was a database built into the language as well?
One that knew about your types
That you could migrate the types
And you'd get... Like type errors if you wanted to execute something that didn't exist
In dev, you would want to be able to switch between different instantiations of the database, like documents kind of.

So the database would have like tables and rows and stuff, right? Or would it be more of a document store?
And is this where crdts come in?

Schema, 'db/people/get 23
I think the database would just make a bunch of functions available that you could call. And they'd have the types already populated and stuff. 
So (db/people/get 23) would do its deal
Now, if you really want to do this seamlessly, it would be annoying to have to ! everywhere. Although maybe you do what effects to be loud... Yeah maybe it's fine. 

Should I have (something! 12) be the same as !(something 12)? Might be nice. It might make things a little complicated. 
