def process_file():
    with open("src/components/LivePreviewFrame.tsx", "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace !previewHtml
    content = content.replace("!previewHtml", "!previewUrl")
    
    # Replace srcDoc={previewHtml}
    content = content.replace("srcDoc={previewHtml}", 'src={previewUrl || "about:blank"}')
    
    # Remove sandbox attributes because WebContainers often need full capabilities and use COOP/COEP anyway,
    # but we can leave standard allow-scripts etc. Actually it's safer to remove sandbox for dev server
    # to avoid issues with WebContainer HMR.
    content = content.replace('sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"', 'sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads allow-pointer-lock"')
    
    with open("src/components/LivePreviewFrame.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    
    print("Successfully patched LivePreviewFrame")

process_file()
