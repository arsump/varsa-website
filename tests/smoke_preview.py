from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':900})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto((root/'index.html').as_uri())
    for route in ['home','acquire','protect','operate','learn','research']:
        page.locator('a[href="#'+route+'"]').first.click()
        assert page.locator('#'+route).is_visible(), route
    page.locator('a[href="#acquire"]').first.click()
    assert page.get_by_text('13 county weather reports in 2024').is_visible()
    page.locator('#query').fill('unsupported')
    page.get_by_role('button',name='Find record').click()
    assert page.get_by_text('Address not covered',exact=False).is_visible()
    page.locator('#query').fill('Fort Collins City Hall')
    page.get_by_role('button',name='Find record').click()
    assert page.get_by_role('heading',name='Fort Collins City Hall').is_visible()
    assert page.get_by_role('link',name='City source').is_visible()
    for width in [390,768,1440]:
        page.set_viewport_size({'width':width,'height':844})
        for route in ['home','acquire','protect','operate','learn','research']:
            page.locator('a[href="#'+route+'"]').first.click()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(route,width)
    assert not errors,errors
    page.locator('a[href="#home"]').first.click()
    page.screenshot(path=str(root/'docs'/'homepage.png'),full_page=True)
    browser.close()
print('PASS: six routes, address lookup and fallback, source link presence, 18 responsive checks, no JS errors')
