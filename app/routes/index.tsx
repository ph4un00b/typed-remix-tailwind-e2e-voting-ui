import { ChangeEvent, Fragment } from "react";
import { useEffect, useRef, useState } from "react";
import { useHydrated } from "remix-utils";
import critical from "~/styles/critical.css";

type Movie = {
  id: string;
  title: string;
  category: string;
  photoUrL: string;
};

type options = {
  [categoryName: string]: Movie[];
};

export function links() {
  // for demo, no css post-process
  // usually use postcss
  return [
    { rel: "stylesheet", href: critical },
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/daisyui@2.24.0/dist/full.css",
    },
  ];
}

export default function Index() {
  let isHydrated = useHydrated();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoaded(true);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, []);

  // just for demo, simulating CSR client-side loading
  if (isHydrated && isLoaded) {
    return (
      <div>
        <SearchCode />
      </div>
    );
  } else {
    // you can use React.Suspense in pure CSR
    // but remix is SSR first
    return (
      <div className="m-auto sm:w-1/2">
        <SkeletonP />
      </div>
    );
  }
}

const moviesEndpoint = "https://ph4un00b.github.io/data/30movies.json";

function SearchCode() {
  const [titles, setTitles] = useState<Movie[]>([
    { id: "", title: "", category: "", photoUrL: "" },
  ]);
  const [query, setQuery] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [moviesMap, setMoviesMap] = useState<options>({});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const control = new AbortController();
    fetchMovies();

    async function fetchMovies() {
      try {
        const res = await fetch(moviesEndpoint, { signal: control.signal });
        if (!res.ok) {
          console.error("hacer algo con el error!");
          return;
        }
        const { movies } = await res.json();
        setTitles(movies);

        const moviesMap: options = {};
        for (const item of movies as Movie[]) {
          if (!(item.category in moviesMap)) {
            moviesMap[item.category] = [];
          }
          moviesMap[item.category].push(item);
        }

        setMoviesMap(moviesMap);

        const orderedCategories = Object.keys(moviesMap).sort((a, b) =>
          a.localeCompare(b)
        );

        setCategories(orderedCategories);
      } catch (e) {
        if (control.signal.aborted) {
          console.error("do something with the abort error!");
        } else {
          console.error("do something with the error!");
        }
      }
    }

    return () => {
      control.abort();
    };
  }, []);

  // we could memoize (useMemo) this but we need real metrics to do that.
  // {
  //   const filteredMovies = useMemo(
  //     () =>
  //       titles.filter(({ title }) =>
  //         title.toLowerCase().includes(query.toLowerCase())
  //       ),
  //     [query, titles],
  //   );
  // }

  const filteredMovies = titles.filter(({ title }) =>
    title.toLowerCase().includes(query.toLowerCase())
  );

  if (titles.length == 0) return <p>...loading</p>;

  return (
    <div className="m-auto sm:w-1/2">
      <h1>Movie Awards</h1>
      <input
        className="input input-bordered w-full my-3 placeholder:uppercase"
        type="text"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setQuery(e.target.value);
        }}
        placeholder="search a movie title..."
        value={query}
      />

      {query.length > 0 ? <span>Results: {filteredMovies.length}</span> : null}

      <ul>
        {filteredMovies.length > 0 && query.length > 0 &&
          filteredMovies
            .slice(0, 8)
            .map((movie) => (
              <p
                className="badge badge-lg badge-accent mr-[1rem] mb-[1rem]"
                key={movie.id}
              >
                {movie.id.replaceAll("-", " ")}
              </p>
            ))}
      </ul>

      <ul>
        {filteredMovies.length > 0 && query.length > 0 &&
          filteredMovies
            .slice(0, 1)
            .map((movie) => (
              <span data-result={movie.id}  key={movie.id}>
                <MovieCardImage data={movie} />
              </span>
            ))}
      </ul>

      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        {categories.map((category) => (
          <div key={category} className="collapse">
            <input type="checkbox" className="peer" />
            <div className="collapse-title m-auto border rounded-md border-gray-300 mb-[1rem] text-primary-content peer-checked:border-rose-600 peer-checked:text-secondary-content">
              {category}
            </div>

            <div className="collapse-content border-tranparent text-primary-content peer-checked:text-secondary-content">
              <div className="carousel carousel-center sm:max-w p-4 space-x-4 sm:space-x-10 bg-neutral">
                {moviesMap[category].length > 0 &&
                  moviesMap[category].map((movie) => (
                    <div
                      key={movie.id}
                      id={`movie-${movie.id}`}
                      className="carousel-item sm:w-full"
                    >
                      <MovieCardImage data={movie} />
                    </div>
                  ))}
              </div>

              <div className="flex flex-row flex-wrap justify-center w-full py-2 gap-2 hidden sm:block">
                {moviesMap[category].length > 0 &&
                  moviesMap[category].map((movie) => (
                    <a
                      key={movie.id}
                      href={`#movie-${movie.id}`}
                      className="btn btn-md m-2"
                    >
                      {String(movie.id).replaceAll("-", " ")}
                    </a>
                  ))}
              </div>
            </div>
          </div>
        ))}

        {/* propswithchildren */}
        <label
          onClick={() => {
            if (formRef.current) {
              const formData = new FormData(formRef.current);
              console.log("sending!", JSON.stringify([...formData.entries()]));
            }
          }}
          htmlFor="my-modal-6"
          className="btn btn-secondary modal-button my-[1.5rem]"
        >
          Submit Votes
        </label>
      </form>

      <input type="checkbox" id="my-modal-6" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg uppercase">Votes sumitted!</h3>
          <p className="py-4">Your votes:</p>
          <div className="modal-action">
            <label htmlFor="my-modal-6" className="btn">
              close
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// colocated components until it grows organically
// then we can procceed to (atomic design, screaming design, by feature, etc.)

function MovieCardImage({ data }: { data: Movie }) {
  return (
    <div className="card w-[16rem] sm:w-[23rem] m-auto bg-base-100 shadow-xl image-full">
      <figure>
        {/* todo: lazy skeleton for img */}
        {/* retrasando la carga de imagenes para alivianar la carga inicial del sitio */}
        <img data-image={data.id} loading="lazy" src={data.photoUrL} alt={`${data.id} imagen`} />
      </figure>
      <div className="grid place-items-center card-body">
        <h2 className="card-title font-medium text-gray-100">{data.title}</h2>
        <div className="card-actions justify-center">
          <RadioBtn data={data} />
        </div>
      </div>
    </div>
  );
}

function RadioBtn({ data }: { data: Movie }) {
  return (
    <label
      htmlFor={`vote-${data.id}`}
      className="relative px-4 py-2 text-center rounded-md cursor-pointer"
    >
      <input
        id={`vote-${data.id}`}
        name={data.category}
        value={data.id}
        type="radio"
        className="hidden z-20 bg-transparent rounded-md peer"
      />
      <span className="inset-0 w-full h-[1rem] m-auto text-white">Vote</span>
      <div className="absolute inset-0 peer-checked:border-sky-500 border rounded-md">
      </div>
    </label>
  );
}

function SkeletonP() {
  return (
    <div>
      <span className="skeleton-box" style={{ width: "80%" }}></span>
      <span className="skeleton-box" style={{ width: "90%" }}></span>
      <span className="skeleton-box" style={{ width: "83%" }}></span>
    </div>
  );
}
