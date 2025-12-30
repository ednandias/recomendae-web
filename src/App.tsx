import { useEffect, useState } from "react";
import movieIllustration from "./assets/illustrations/movie.svg";
import { Icon } from "./components/Icon";
import { getAPIError, showAPIError } from "./utils/error";
import { api } from "./services/api";
import { Loader } from "./components/Loader";
import type { RecommendResponse } from "./interfaces";
import { Tooltip } from "react-tooltip";
import { Checkbox } from "./components/Checkbox";
import { ContentLoader } from "./components/ContentLoader";
import { setParams } from "./utils/setParams";

interface Genre {
  id: number;
  name: string;
}

function App() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isGenresLoading, setIsGenresLoading] = useState(true);
  const [selectedGenreId, setSelectedGenreId] = useState("");
  const [movie, setMovie] = useState<RecommendResponse | null>(null);
  const [isMovieLoading, setIsMovieLoading] = useState(false);
  const [isDeepSearchSelected, setIsDeepSearchSelected] = useState(false);

  async function handleRecommend() {
    try {
      setIsMovieLoading(true);

      const url = setParams("/recommend", [
        {
          key: "genreId",
          value: selectedGenreId,
        },
        {
          key: "deepSearch",
          value: isDeepSearchSelected ? "yes" : "no",
        },
      ]);

      const response = await api.get<RecommendResponse>(url);

      setMovie(response.data);
    } catch (err) {
      showAPIError(err, "Erro ao recomendar filme");
    } finally {
      setIsMovieLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function fetchGenres() {
      try {
        setIsGenresLoading(true);

        const response = await api.get("/genres");

        if (active) {
          setGenres(response.data);
          setSelectedGenreId(response.data[0].id);
        }
      } catch (err) {
        getAPIError(err, "Erro ao buscar os gêneros");
      } finally {
        setIsGenresLoading(false);
      }
    }

    fetchGenres();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center overflow-hidden bg-[#210340] text-[#fd8915]">
      <div className="min-h-screen sm:flex sm:items-center sm:justify-center">
        {movie?.title ? (
          <div
            className="flex flex-col items-center justify-center gap-5 sm:min-w-[50%] sm:w-[50%]"
            style={{
              padding: 40,
            }}
          >
            <img src={movie.poster} alt={movie.title} className="w-50" />

            <h1 className="text-2xl font-bold text-center">
              {movie.title} ({new Date(movie.release_date).getFullYear()})
            </h1>

            <div className="flex items-center justify-center gap-2">
              <Icon name="Star" color="#fd8915" weight="fill" size={25} />

              <p className="text-2xl font-bold text-center">
                {movie.rating.toFixed(2)}
              </p>
            </div>

            <p className="text-center text-white text-lg">{movie.synopsis}</p>

            {movie.streaming.length > 0 && (
              <>
                <h2 className="text-2xl font-bold">Streamings: </h2>

                <section className="w-full flex items-center justify-center gap-3">
                  {movie.streaming.map((s) => (
                    <article className="text">
                      <img src={s.logo_path} className="w-15" />
                    </article>
                  ))}
                </section>
              </>
            )}

            {movie.rent.length > 0 && (
              <>
                <h2 className="text-2xl font-bold">Aluguel: </h2>

                <section className="w-full flex items-center justify-center gap-3">
                  {movie.rent.map((s) => (
                    <article className="text">
                      <img src={s.logo_path} className="w-15" />
                    </article>
                  ))}
                </section>
              </>
            )}

            {movie.buy.length > 0 && (
              <>
                <h2 className="text-2xl font-bold">Compra: </h2>

                <section className="w-full flex items-center justify-center gap-3">
                  {movie.buy.map((s) => (
                    <article className="text">
                      <img src={s.logo_path} className="w-15" />
                    </article>
                  ))}
                </section>
              </>
            )}

            <hr className="w-full border-solid border-2" />

            <div className="flex gap-2 items-center justify-center">
              <Checkbox
                id="deep-search"
                label="Pesquisa Profunda"
                checked={isDeepSearchSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    setIsDeepSearchSelected(true);
                  } else {
                    setIsDeepSearchSelected(false);
                  }
                }}
              />

              <a
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Faz uma pesquisa mais ampla, porém demora um pouco mais"
                data-tooltip-place="top"
              >
                <label htmlFor="deep-search">Pesquisa Profunda</label>
              </a>
            </div>

            <Tooltip id="my-tooltip" />

            <select
              value={selectedGenreId}
              onChange={(e) => setSelectedGenreId(e.target.value)}
              className="w-50 h-10 rounded-xl p-4 bg-white text-[#210340] text-center font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isMovieLoading}
            >
              {genres.map((genre) => (
                <option value={genre.id}>{genre.name}</option>
              ))}
            </select>

            <button
              className="bg-[#fd8915] text-[#210340] text-xl font-bold w-80 h-15 rounded-2xl cursor-pointer flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              onClick={handleRecommend}
              disabled={isMovieLoading}
            >
              {isMovieLoading ? (
                <Loader color="white" />
              ) : (
                <>
                  <Icon
                    name="FilmReel"
                    weight="bold"
                    size={25}
                    color="#210340"
                  />
                  Recomendaê
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            <div
              className="min-h-screen flex flex-col items-center justify-center"
              style={{
                paddingLeft: 20,
                paddingRight: 20,
                marginBottom: 20,
              }}
            >
              <img src={movieIllustration} className="w-80 h-80" />

              <h3 className="font-bold text-3xl">Luz. Câmera. Ação.</h3>

              <p className="text-lg text-center text-white">
                Não sabe o que assistir? Apenas escolha seu gênero favorito e
                deixe com a gente.
              </p>

              <div
                className="flex flex-col items-center gap-3"
                style={{
                  marginTop: 20,
                }}
              >
                <ContentLoader isLoading={isGenresLoading}>
                  <div className="flex items-center justify-center gap-2">
                    <Checkbox
                      id="deep-search"
                      label="Pesquisa Profunda"
                      checked={isDeepSearchSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setIsDeepSearchSelected(true);
                        } else {
                          setIsDeepSearchSelected(false);
                        }
                      }}
                    />

                    <a
                      data-tooltip-id="my-tooltip"
                      data-tooltip-content="Faz uma pesquisa mais ampla, porém demora um pouco mais"
                      data-tooltip-place="top"
                    >
                      <label htmlFor="deep-search">Pesquisa Profunda</label>
                    </a>
                  </div>

                  <Tooltip id="my-tooltip" />

                  <select
                    value={selectedGenreId}
                    onChange={(e) => setSelectedGenreId(e.target.value)}
                    className="w-50 h-10 rounded-xl p-4 bg-white text-[#210340] text-center font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isMovieLoading}
                  >
                    {genres.map((genre) => (
                      <option value={genre.id}>{genre.name}</option>
                    ))}
                  </select>

                  <button
                    className="bg-[#fd8915] text-[#210340] text-xl font-bold w-80 h-15 rounded-2xl cursor-pointer flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    onClick={handleRecommend}
                    disabled={isMovieLoading}
                  >
                    {isMovieLoading ? (
                      <Loader color="white" />
                    ) : (
                      <>
                        <Icon
                          name="FilmReel"
                          weight="bold"
                          size={25}
                          color="#210340"
                        />
                        Recomendaê
                      </>
                    )}
                  </button>
                </ContentLoader>
              </div>
            </div>
          </>
        )}
      </div>

      <footer
        className="w-full bg-[#fd8915] flex flex-col items-center justify-center rounded-tl-2xl rounded-tr-2xl"
        style={{
          padding: 10,
        }}
      >
        <p className="text-[#210340] text-[12px] text-center">
          Todos os dados fornecidos por{" "}
          <a
            target="_blank"
            href="https://www.themoviedb.org"
            className="underline font-bold"
          >
            The Movie Database (TMDB)
          </a>
        </p>

        <p className="text-[#210340] text-[12px] text-center">
          Feito na Lemmingland por{" "}
          <a
            target="_blank"
            href="https://www.ednandias.dev"
            className="underline font-bold"
          >
            Ednan Dias
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
