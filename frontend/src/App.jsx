import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Bible } from "./pages/Bible/Bible.jsx";
import { Tags } from "./pages/Tags/Tags.jsx";
import { Print } from "./pages/Print/Print.jsx";
import "inter-ui/inter.css";
import { ColorSchemeScript, MantineProvider, Paper } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import ColorSchemeContext from './ColorSchemeContext';
import favicon from './assets/favicon.png'; // Imported for prod build.
import { useState } from "react";
import { useColorScheme } from "@mantine/hooks";

function App() { 

  const router = createBrowserRouter(
    [
      {
        path: "/tags",
        element: <Tags />,
      },
      {
        path: "/print",
        element: <Print />,
        children: [
          {
            path: ":tag",
            element: <Print />,
          }
        ]
      },
      {
        path: "/",
        element: <Bible />,
        children: [
          {
            path: ":book",
            element: <Bible />,
            children: [
              {
                path: ":chapter",
                element: <Bible />,
                children: [
                  {
                    path: ":verse",
                    element: <Bible />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    {
      basename: '/local/bible',
    }
  );

 


  return (
    <>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider 
        defaultColorScheme="auto"
        /*theme={{
          colorScheme: colorScheme,
          fontFamily: '"Inter var", -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif',
          fontSizes: {
            md: '1.0625rem',
          },
          headings: {
            fontFamily: '"Inter var", -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif',
            h1: { fontSize: '1.5rem' },
            h2: { fontSize: '1.25rem' },
            h3: { fontSize: '1.5rem' },
            h4: { fontSize: '0.875rem' },
            h5: { fontSize: '0.75rem' },
            h6: { fontSize: '0.625rem' },
          },
          colors: {
            'papiri': ['#faf8f7','#faf8f7','#faf8f7','#faf8f7','#faf8f7','#faf8f7','#faf8f7','#faf8f7','#faf8f7','#faf8f7'],
            'white': ['#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff'],
            'sysgrey': ['#f1f5f9','#f1f5f9','#f1f5f9','#f1f5f9','#f1f5f9','#f1f5f9','#f1f5f9','#f1f5f9','#f1f5f9','#f1f5f9'],
          },
        }}*/
      >
        <ModalsProvider>
          <RouterProvider router={router} />
        </ModalsProvider>
      </MantineProvider>
    </>
  );
}

export default App
