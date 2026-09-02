def posable(a):
    count = {}

    for char in a:
        if char in count:
            count[char] += 1
        else:
            count[char] = 1

    for char in a:
        if count[char] == 1:
            return char

    return None

print(posable("swiss"))   
print(posable("racecar")) 
print(posable("Aabb"))    
print(posable("aabb"))    
print(posable("Ayams"))
print(posable("goreng"))    
print(posable("hello"))    